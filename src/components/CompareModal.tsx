'use client';

import React from 'react';
import { AyranEntry, kategoriEtiketleri, kategoriRenkleri } from '../types/ayran';

interface CompareModalProps {
  isOpen: boolean;
  compareItems: AyranEntry[];
  onClose: () => void;
}

export default function CompareModal({ isOpen, compareItems, onClose }: CompareModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Belirtilmemiş';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    } catch {}
    return dateStr;
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content compare-modal-content">
        <div className="modal-header">
          <h3 className="modal-title">⚖️ Ayran Karşılaştırma Arenası</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="compare-grid">
          {compareItems.map((item) => {
            const kategoriRenk = kategoriRenkleri[item.kategori];
            const kategoriEtiket = kategoriEtiketleri[item.kategori];

            return (
              <div key={item.id} className="compare-col">
                {/* Görsel */}
                {item.fotograf_url && (
                  <img
                    src={item.fotograf_url}
                    alt={item.marka}
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                  />
                )}

                <div className="compare-card-title">{item.marka}</div>
                {item.urun_adi && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {item.urun_adi}
                  </div>
                )}

                {/* Kategori Chip */}
                <div style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: kategoriRenk + '22',
                  color: kategoriRenk,
                  border: `1px solid ${kategoriRenk}44`,
                  marginBottom: '10px',
                }}>
                  {kategoriEtiket}
                </div>

                {/* Ekşi badge */}
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  {item.eksi_mi
                    ? <span style={{ color: 'hsl(38,92%,50%)', fontWeight: 600 }}>🍋 Ekşi Ayran</span>
                    : <span style={{ color: 'var(--text-muted)' }}>Normal Ayran</span>
                  }
                </div>

                {/* Koşullu bilgiler */}
                {item.kategori === 'market_markasi' && item.market_adi && (
                  <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                    🏪 <strong>Market:</strong> {item.market_adi}
                  </div>
                )}
                {item.kategori === 'yoresel' && item.yore && (
                  <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                    📍 <strong>Yöre:</strong> {item.yore}
                  </div>
                )}

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px', fontSize: '0.85rem', marginBottom: '6px' }}>
                  📅 <strong>Tarih:</strong> {formatDate(item.icme_tarihi)}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.35', maxHeight: '100px', overflowY: 'auto' }}>
                  📝 <strong>Not:</strong> {item.notlar || 'Not girilmemiş.'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button className="btn btn-primary" onClick={onClose}>Kapat</button>
        </div>
      </div>
    </div>
  );
}
