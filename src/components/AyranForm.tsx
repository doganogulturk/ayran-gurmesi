'use client';

import React, { useState, useRef } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { uploadFotograf } from '../lib/ayranlar';

interface AyranFormProps {
  isOpen: boolean;
  editingItem: AyranEntry | null;
  initialCategory?: Kategori;
  onClose: () => void;
  onSave: (entry: AyranEntry) => void;
  onDelete?: () => void;
}

export default function AyranForm({ isOpen, editingItem, initialCategory, onClose, onSave, onDelete }: AyranFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [marka, setMarka] = useState(editingItem?.marka ?? '');
  const [urunAdi, setUrunAdi] = useState(editingItem?.urun_adi ?? '');
  const [kategori, setKategori] = useState<Kategori>(editingItem?.kategori ?? initialCategory ?? 'yaygin_market');
  const [eksiMi, setEksiMi] = useState(editingItem?.eksi_mi ?? false);
  const [marketAdi, setMarketAdi] = useState(editingItem?.market_adi ?? '');
  const [yore, setYore] = useState(editingItem?.yore ?? '');
  const [notlar] = useState(editingItem?.notlar ?? '');
  const [fotografUrl, setFotografUrl] = useState(editingItem?.fotograf_url ?? '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marka.trim()) return;

    onSave({
      id: editingItem?.id || '',
      created_at: editingItem?.created_at,
      marka: marka.trim(),
      urun_adi: urunAdi.trim() || null,
      kategori,
      eksi_mi: eksiMi,
      market_adi: kategori === 'market_markasi' ? (marketAdi.trim() || null) : null,
      yore: kategori === 'yoresel' ? (yore.trim() || null) : null,
      notlar: notlar.trim() || null,
      fotograf_url: fotografUrl.trim() || null,
    });
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
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingItem ? 'Ayran Kaydını Düzenle' : 'Yeni Ayran Ekle'}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Marka */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ayranMarka" className="form-label">Marka *</label>
              <input
                type="text"
                id="ayranMarka"
                className="form-input"
                value={marka}
                onChange={(e) => setMarka(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Ürün Adı */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ayranUrunAdi" className="form-label">Ürün Adı</label>
              <input
                type="text"
                id="ayranUrunAdi"
                className="form-input"
                value={urunAdi}
                onChange={(e) => setUrunAdi(e.target.value)}
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Kategori *</span>
              <div className="radio-group">
                {kategoriler.map((kat) => (
                  <label key={kat} className={`radio-option ${kategori === kat ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="kategori"
                      value={kat}
                      checked={kategori === kat}
                      onChange={() => setKategori(kat)}
                    />
                    <span>{kategoriEtiketleri[kat]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ekşi */}
          <div className="form-row">
            <div className="form-group form-group-inline">
              <span className="form-label">Ekşi</span>
              <button
                type="button"
                className={`toggle-button ${eksiMi ? 'active' : ''}`}
                onClick={() => setEksiMi(prev => !prev)}
                aria-pressed={eksiMi}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>

          {/* Koşullu: Market Adı */}
          {kategori === 'market_markasi' && (
            <div className="form-group">
              <label htmlFor="ayranMarketAdi" className="form-label">Market Adı</label>
              <input
                type="text"
                id="ayranMarketAdi"
                className="form-input"
                placeholder="Örn: Migros, BİM, A101, CarrefourSA"
                value={marketAdi}
                onChange={(e) => setMarketAdi(e.target.value)}
              />
            </div>
          )}

          {/* Koşullu: Yöre */}
          {kategori === 'yoresel' && (
            <div className="form-group">
              <label htmlFor="ayranYore" className="form-label">Yöre / Köy</label>
              <input
                type="text"
                id="ayranYore"
                className="form-input"
                placeholder="Örn: Konya, Sivas Divriği, Erzurum"
                value={yore}
                onChange={(e) => setYore(e.target.value)}
              />
            </div>
          )}

          {/* Fotoğraf Yükleme */}
          <div className="form-group">
            <label className="form-label">Fotoğraf (Supabase Storage)</label>
            <div
              className="image-upload-area"
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ cursor: uploading ? 'wait' : 'pointer' }}
            >
              {uploading ? (
                <span>⏳ Yükleniyor...</span>
              ) : fotografUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotografUrl} className="upload-preview" alt="Önizleme" style={{ display: 'block' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Değiştirmek için tıkla</span>
                </>
              ) : (
                <>
                  <span>📷 Fotoğraf Seç veya Sürükle</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supabase Storage&apos;a yüklenir</span>
                </>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '20px' }}>
            {editingItem ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={onDelete}
              >
                Sil
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Vazgeç</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Fotoğraf yükleniyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
