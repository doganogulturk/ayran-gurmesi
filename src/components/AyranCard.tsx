'use client';

import React from 'react';
import { AyranEntry, kategoriEtiketleri, kategoriRenkleri } from '../types/ayran';

interface AyranCardProps {
  item: AyranEntry;
  isCompareChecked: boolean;
  onCompareToggle: (id: string, checked: boolean) => void;
  onEdit: (item: AyranEntry) => void;
  onDelete: (id: string) => void;
}

export default function AyranCard({
  item,
  isCompareChecked,
  onCompareToggle,
  onEdit,
  onDelete,
}: AyranCardProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    } catch {}
    return dateStr;
  };

  const kategoriRenk = kategoriRenkleri[item.kategori] || 'var(--primary)';
  const kategoriEtiket = kategoriEtiketleri[item.kategori] || item.kategori;

  return (
    <div className="card ayran-card">
      {/* Görsel */}
      <div className="card-img-wrapper">
        {item.fotograf_url ? (
          <img
            src={item.fotograf_url}
            className="card-img"
            alt={item.marka}
            onError={(e) => {
              (e.target as HTMLElement).parentElement!.innerHTML = `
                <div class="card-img-placeholder">
                  <span style="font-size:2.2rem">🥛</span>
                  <span>Görsel Yüklenemedi</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="card-img-placeholder">
            <span style={{ fontSize: '2.2rem' }}>🥛</span>
            <span>Görsel Eklenmedi</span>
          </div>
        )}

        <span
          className="card-category-badge"
          style={{ borderLeft: `3px solid ${kategoriRenk}` }}
        >
          {kategoriEtiket}
        </span>

        {item.eksi_mi && (
          <span className="card-rating-badge" style={{ background: 'hsl(38,92%,45%)' }}>
            🍋 Ekşi
          </span>
        )}
      </div>

      {/* Başlık */}
      <div className="card-title-row">
        <h4 className="card-title">{item.marka}</h4>
        {item.urun_adi && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {item.urun_adi}
          </p>
        )}
      </div>

      {/* Meta bilgiler */}
      <div className="card-sub">
        {item.kategori === 'market_markasi' && item.market_adi && (
          <span>🏪 {item.market_adi}</span>
        )}
        {item.kategori === 'yoresel' && item.yore && (
          <span>📍 {item.yore}</span>
        )}
        {item.icme_tarihi && (
          <span>📅 {formatDate(item.icme_tarihi)}</span>
        )}
      </div>

      {/* Notlar */}
      <p className="card-notes">{item.notlar || 'Herhangi bir not girilmemiş.'}</p>

      {/* Footer */}
      <div className="card-footer">
        <span />
        <div className="card-actions">
          <label className="compare-chk-wrapper">
            <input
              type="checkbox"
              className="compare-chk"
              checked={isCompareChecked}
              onChange={(e) => onCompareToggle(item.id, e.target.checked)}
            />
            Seç
          </label>
          <button
            onClick={() => onEdit(item)}
            className="btn btn-secondary btn-icon"
            style={{ padding: '5px' }}
            title="Düzenle"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="btn btn-danger btn-icon"
            style={{ padding: '5px' }}
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
