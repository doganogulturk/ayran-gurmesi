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

const kategoriEmoji: Record<Kategori, string> = {
  yaygin_market: '🛒',
  market_markasi: '🏪',
  yoresel: '🌿',
};

export default function AyranForm({ isOpen, editingItem, initialCategory, onClose, onSave, onDelete }: AyranFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [marka, setMarka] = useState(editingItem?.marka ?? '');
  const [urunAdi, setUrunAdi] = useState(editingItem?.urun_adi ?? '');
  const [kategori, setKategori] = useState<Kategori>(editingItem?.kategori ?? initialCategory ?? 'yaygin_market');
  const [eksiMi, setEksiMi] = useState(editingItem?.eksi_mi ?? false);
  const [marketAdi, setMarketAdi] = useState(editingItem?.market_adi ?? '');
  const [yore, setYore] = useState(editingItem?.yore ?? '');
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
            {editingItem ? 'Kaydı Düzenle' : 'Yeni Ayran Ekle'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Task 5: Photo on the left spanning 2 rows height, Marka & Ürün Adı on the right side */}
          <div className="form-top-compact">
            {/* Left side: Photo Upload Box */}
            <div className="form-photo-col">
              <label className="form-label">Fotoğraf</label>
              <div
                className="compact-upload-box"
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ cursor: uploading ? 'wait' : 'pointer' }}
                title="Fotoğraf Yükle"
              >
                {uploading ? (
                  <span className="upload-loading">⏳</span>
                ) : fotografUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotografUrl} className="compact-preview" alt="Önizleme" />
                    <span className="compact-change-tag">Değiştir</span>
                  </>
                ) : (
                  <>
                    <span className="compact-cam-icon">📷</span>
                    <span className="compact-upload-text">Fotoğraf Ekle</span>
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

            {/* Right side: Marka & Ürün Adı */}
            <div className="form-inputs-col">
              <div className="form-group-sm">
                <label htmlFor="ayranMarka" className="form-label">Marka *</label>
                <input
                  type="text"
                  id="ayranMarka"
                  className="form-input"
                  placeholder="Örn: Sütaş, Pınar…"
                  value={marka}
                  onChange={(e) => setMarka(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group-sm">
                <label htmlFor="ayranUrunAdi" className="form-label">Ürün Adı</label>
                <input
                  type="text"
                  id="ayranUrunAdi"
                  className="form-input"
                  placeholder="Örn: Yayık Ayranı…"
                  value={urunAdi}
                  onChange={(e) => setUrunAdi(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Task 4: Kategori options in a single horizontal line (3 columns) */}
          <div className="form-row">
            <div className="form-group">
              <span className="form-label">Kategori *</span>
              <div className="radio-group-horizontal">
                {kategoriler.map((kat) => (
                  <label key={kat} className={`radio-pill ${kategori === kat ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="kategori"
                      value={kat}
                      checked={kategori === kat}
                      onChange={() => setKategori(kat)}
                    />
                    <span className="radio-emoji">{kategoriEmoji[kat]}</span>
                    <span className="radio-text">{kategoriEtiketleri[kat]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ekşi toggle */}
          <div className="form-row">
            <div className="form-group form-group-inline">
              <span className="form-label">Ekşi mi?</span>
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

          {/* Market Adı (koşullu) */}
          {kategori === 'market_markasi' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ayranMarketAdi" className="form-label">Market Adı</label>
                <input
                  type="text"
                  id="ayranMarketAdi"
                  className="form-input"
                  placeholder="Migros, BİM, A101, CarrefourSA…"
                  value={marketAdi}
                  onChange={(e) => setMarketAdi(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Yöre (koşullu) */}
          {kategori === 'yoresel' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ayranYore" className="form-label">Yöre / Köy</label>
                <input
                  type="text"
                  id="ayranYore"
                  className="form-input"
                  placeholder="Konya, Sivas Divriği, Erzurum…"
                  value={yore}
                  onChange={(e) => setYore(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="form-actions-bar">
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

            <div className="actions-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Vazgeç
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Yükleniyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
