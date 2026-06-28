'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { uploadFotograf } from '../lib/ayranlar';

interface AyranFormProps {
  isOpen: boolean;
  editingItem: AyranEntry | null;
  onClose: () => void;
  onSave: (entry: AyranEntry) => void;
}

export default function AyranForm({ isOpen, editingItem, onClose, onSave }: AyranFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [marka, setMarka] = useState('');
  const [urunAdi, setUrunAdi] = useState('');
  const [kategori, setKategori] = useState<Kategori>('yaygin_market');
  const [eksiMi, setEksiMi] = useState(false);
  const [marketAdi, setMarketAdi] = useState('');
  const [yore, setYore] = useState('');
  const [notlar, setNotlar] = useState('');
  const [icmeTarihi, setIcmeTarihi] = useState('');
  const [fotografUrl, setFotografUrl] = useState('');

  useEffect(() => {
    if (editingItem) {
      setMarka(editingItem.marka);
      setUrunAdi(editingItem.urun_adi || '');
      setKategori(editingItem.kategori);
      setEksiMi(editingItem.eksi_mi);
      setMarketAdi(editingItem.market_adi || '');
      setYore(editingItem.yore || '');
      setNotlar(editingItem.notlar || '');
      setIcmeTarihi(editingItem.icme_tarihi || '');
      setFotografUrl(editingItem.fotograf_url || '');
    } else {
      setMarka('');
      setUrunAdi('');
      setKategori('yaygin_market');
      setEksiMi(false);
      setMarketAdi('');
      setYore('');
      setNotlar('');
      setIcmeTarihi(new Date().toISOString().split('T')[0]);
      setFotografUrl('');
    }
  }, [editingItem, isOpen]);

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
      icme_tarihi: icmeTarihi || null,
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
    } catch (err: any) {
      alert('Fotoğraf yüklenirken hata oluştu: ' + err.message);
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
          {/* Marka & Ürün Adı */}
          <div className="form-row form-row-2">
            <div className="form-group">
              <label htmlFor="ayranMarka" className="form-label">Marka *</label>
              <input
                type="text"
                id="ayranMarka"
                className="form-input"
                placeholder="Örn: Sütaş, Migros, Köy Lezzeti"
                value={marka}
                onChange={(e) => setMarka(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ayranUrunAdi" className="form-label">Ürün Adı</label>
              <input
                type="text"
                id="ayranUrunAdi"
                className="form-input"
                placeholder="Örn: Sütaş Ayran 200ml (opsiyonel)"
                value={urunAdi}
                onChange={(e) => setUrunAdi(e.target.value)}
              />
            </div>
          </div>

          {/* Kategori & Ekşi */}
          <div className="form-row form-row-2">
            <div className="form-group">
              <label htmlFor="ayranKategori" className="form-label">Kategori *</label>
              <select
                id="ayranKategori"
                className="form-input"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as Kategori)}
                required
              >
                {kategoriler.map((kat) => (
                  <option key={kat} value={kat}>{kategoriEtiketleri[kat]}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px' }}>
              <label className="form-label" style={{ margin: 0 }}>Ekşi Ayran mı?</label>
              <div
                id="eksiToggle"
                onClick={() => setEksiMi(prev => !prev)}
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '14px',
                  background: eksiMi ? 'hsl(38, 92%, 50%)' : 'var(--border-color)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.25s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  left: eksiMi ? '28px' : '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.25s',
                }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {eksiMi ? '🍋 Evet' : 'Hayır'}
              </span>
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

          {/* Tarih */}
          <div className="form-group">
            <label htmlFor="ayranTarih" className="form-label">İçildiği Tarih</label>
            <input
              type="date"
              id="ayranTarih"
              className="form-input"
              value={icmeTarihi}
              onChange={(e) => setIcmeTarihi(e.target.value)}
            />
          </div>

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
                  <img src={fotografUrl} className="upload-preview" alt="Önizleme" style={{ display: 'block' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Değiştirmek için tıkla</span>
                </>
              ) : (
                <>
                  <span>📷 Fotoğraf Seç veya Sürükle</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supabase Storage'a yüklenir</span>
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

          {/* Notlar */}
          <div className="form-group">
            <label htmlFor="ayranNotlar" className="form-label">Gözlemler / Yorumlar</label>
            <textarea
              id="ayranNotlar"
              className="form-input"
              placeholder="Tadı nasıldı? Nerede içtin? Dikkat çeken özellikleri neler?"
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Fotoğraf yükleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
