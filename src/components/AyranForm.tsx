'use client';

import React, { useState, useRef } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { uploadFotograf } from '../lib/ayranlar';

interface AyranFormProps {
  isOpen: boolean;
  editingItem: AyranEntry | null;
  initialCategory?: Kategori;
  existingAyrans?: AyranEntry[];
  onClose: () => void;
  onSave: (entry: AyranEntry, targetIndex?: number) => void;
  onDelete?: () => void;
}

const kategoriEmoji: Record<Kategori, string> = {
  yaygin_market: '🛒',
  market_markasi: '🏪',
  yoresel: '🌿',
};

export default function AyranForm({
  isOpen,
  editingItem,
  initialCategory,
  existingAyrans = [],
  onClose,
  onSave,
  onDelete,
}: AyranFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [marka, setMarka] = useState(editingItem?.marka ?? '');
  const [urunAdi, setUrunAdi] = useState(editingItem?.urun_adi ?? '');
  const [kategori, setKategori] = useState<Kategori>(editingItem?.kategori ?? initialCategory ?? 'yaygin_market');
  const [eksiMi, setEksiMi] = useState(editingItem?.eksi_mi ?? false);
  const [marketAdi, setMarketAdi] = useState(editingItem?.market_adi ?? '');
  const [yore, setYore] = useState(editingItem?.yore ?? '');
  const [fotografUrl, setFotografUrl] = useState(editingItem?.fotograf_url ?? '');

  // Sıralama konumu seçimi (yalnızca yeni kayıtlar için)
  const [positionMode, setPositionMode] = useState<'top' | 'bottom' | 'after'>('top');
  const [afterItemId, setAfterItemId] = useState<string>(existingAyrans[0]?.id ?? '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marka.trim()) return;

    let targetIndex: number | undefined = undefined;

    if (!editingItem) {
      if (positionMode === 'top') {
        targetIndex = 0;
      } else if (positionMode === 'bottom') {
        targetIndex = existingAyrans.length;
      } else if (positionMode === 'after' && afterItemId) {
        const foundIdx = existingAyrans.findIndex(a => a.id === afterItemId);
        targetIndex = foundIdx !== -1 ? foundIdx + 1 : 0;
      }
    }

    onSave(
      {
        id: editingItem?.id || '',
        created_at: editingItem?.created_at,
        marka: marka.trim(),
        urun_adi: urunAdi.trim() || null,
        kategori,
        eksi_mi: eksiMi,
        market_adi: kategori === 'market_markasi' ? (marketAdi.trim() || null) : null,
        yore: kategori === 'yoresel' ? (yore.trim() || null) : null,
        fotograf_url: fotografUrl.trim() || null,
      },
      targetIndex
    );
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFotograf(file);
      setFotografUrl(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Fotoğraf yüklenirken hata oluştu: ' + message);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content drawer-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingItem ? 'Ayran Kaydını Düzenle' : 'Yeni Ayran Ekle'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* Top Hero Photo Banner */}
          <div className="hero-photo-container">
            <div
              className={`hero-photo-banner ${fotografUrl ? 'has-image' : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ cursor: uploading ? 'wait' : 'pointer' }}
            >
              {uploading ? (
                <div className="hero-upload-state">
                  <span className="spinner-icon">⌛</span>
                  <span>Fotoğraf Yükleniyor…</span>
                </div>
              ) : fotografUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotografUrl} className="hero-photo-img" alt="Ayran Görseli" />
                  <div className="hero-photo-overlay">
                    <span className="hero-action-btn">📸 Görseli Değiştir</span>
                    <button
                      type="button"
                      className="hero-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFotografUrl('');
                      }}
                      title="Fotoğrafı Kaldır"
                    >
                      Kaldır
                    </button>
                  </div>
                </>
              ) : (
                <div className="hero-upload-placeholder">
                  <div className="hero-icon-circle">📸</div>
                  <span className="hero-upload-title">Ayran Fotoğrafı Ekle</span>
                  <span className="hero-upload-sub">Sürükleyip bırakın veya seçmek için tıklayın</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
          </div>

          <div className="form-sections">
            {/* Marka ve Ürün Adı */}
            <div className="form-row-grid">
              <div className="form-group-item">
                <label htmlFor="ayranMarka" className="form-label-styled">Marka *</label>
                <input
                  type="text"
                  id="ayranMarka"
                  className="form-input-styled"
                  placeholder="Örn: Sütaş, Pınar, Özerhisar…"
                  value={marka}
                  onChange={(e) => setMarka(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group-item">
                <label htmlFor="ayranUrunAdi" className="form-label-styled">Ürün Adı / Çeşidi</label>
                <input
                  type="text"
                  id="ayranUrunAdi"
                  className="form-input-styled"
                  placeholder="Örn: Cam Şişe, Yayık, Tam Yağlı…"
                  value={urunAdi}
                  onChange={(e) => setUrunAdi(e.target.value)}
                />
              </div>
            </div>

            {/* Kategori Seçimi */}
            <div className="form-group-item">
              <label className="form-label-styled">Kategori *</label>
              <div className="radio-group-styled">
                {kategoriler.map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    className={`radio-pill-styled ${kat} ${kategori === kat ? 'selected' : ''}`}
                    onClick={() => setKategori(kat)}
                  >
                    <span className="radio-pill-emoji">{kategoriEmoji[kat]}</span>
                    <span className="radio-pill-label">{kategoriEtiketleri[kat]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Market Adı veya Yöre (Koşullu) */}
            {kategori === 'market_markasi' && (
              <div className="form-group-item animated-fade-in">
                <label htmlFor="ayranMarketAdi" className="form-label-styled">Satılan Market</label>
                <input
                  type="text"
                  id="ayranMarketAdi"
                  className="form-input-styled"
                  placeholder="Örn: Migros, BİM, A101, File…"
                  value={marketAdi}
                  onChange={(e) => setMarketAdi(e.target.value)}
                />
              </div>
            )}

            {kategori === 'yoresel' && (
              <div className="form-group-item animated-fade-in">
                <label htmlFor="ayranYore" className="form-label-styled">Yöre / Şehir / Köy</label>
                <input
                  type="text"
                  id="ayranYore"
                  className="form-input-styled"
                  placeholder="Örn: Balıkesir Susurluk, Konya, Erzurum…"
                  value={yore}
                  onChange={(e) => setYore(e.target.value)}
                />
              </div>
            )}

            {/* Ekşi mi? Toggle */}
            <div className="form-group-item toggle-box">
              <div className="toggle-info">
                <span className="toggle-title">Ekşi Tat Profili</span>
                <span className="toggle-sub">Ekşimsi / fermante ayran lezzeti var mı?</span>
              </div>
              <button
                type="button"
                className={`toggle-switch ${eksiMi ? 'active' : ''}`}
                onClick={() => setEksiMi(prev => !prev)}
                aria-pressed={eksiMi}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            {/* Sıralama Konumu Seçimi (Yalnızca Yeni Eklerken) */}
            {!editingItem && existingAyrans.length > 0 && (
              <div className="form-group-item position-selector-box">
                <label className="form-label-styled">Sıralamadaki Yeri</label>
                <div className="position-pills">
                  <button
                    type="button"
                    className={`pos-pill ${positionMode === 'top' ? 'active' : ''}`}
                    onClick={() => setPositionMode('top')}
                  >
                    🥇 En Üste (1. Sıra)
                  </button>
                  <button
                    type="button"
                    className={`pos-pill ${positionMode === 'bottom' ? 'active' : ''}`}
                    onClick={() => setPositionMode('bottom')}
                  >
                    🔻 En Alta
                  </button>
                  <button
                    type="button"
                    className={`pos-pill ${positionMode === 'after' ? 'active' : ''}`}
                    onClick={() => setPositionMode('after')}
                  >
                    📌 Seçili Ayranın Altına
                  </button>
                </div>

                {positionMode === 'after' && (
                  <div className="select-after-wrapper animated-fade-in">
                    <select
                      className="form-select-styled"
                      value={afterItemId}
                      onChange={(e) => setAfterItemId(e.target.value)}
                    >
                      {existingAyrans.map((item, idx) => (
                        <option key={item.id} value={item.id}>
                          #{idx + 1} - {item.marka} {item.urun_adi ? `(${item.urun_adi})` : ''} sonrasına ekle
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Alt Aksiyonlar Barı */}
          <div className="form-actions-sticky">
            {editingItem && onDelete ? (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={onDelete}
              >
                🗑️ Kaydı Sil
              </button>
            ) : <div />}

            <div className="actions-right-group">
              <button type="button" className="btn-secondary-styled" onClick={onClose}>
                Vazgeç
              </button>
              <button type="submit" className="btn-primary-styled" disabled={uploading}>
                {uploading ? 'Yükleniyor…' : editingItem ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

