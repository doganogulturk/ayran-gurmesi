'use client';

import React from 'react';
import { Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';

export type ViewMode = 'hepsi' | 'eksi' | 'tatli';

export const KAT_COLOR: Record<Kategori, string> = {
  yaygin_market: '#3f6cd4',
  market_markasi: '#c9812a',
  yoresel: '#2f8f6b',
};

const VIEW_OPTIONS: { key: ViewMode; label: string; short: string }[] = [
  { key: 'hepsi', label: 'Tüm Kayıtlar', short: 'Tümü' },
  { key: 'eksi', label: 'Ekşiler', short: 'Ekşi' },
  { key: 'tatli', label: 'Ekşi Olmayanlar', short: 'Ekşisiz' },
];

/** Mobil şeritte üç seçenek tek satıra sığsın diye kısa etiketler. */
const KAT_SHORT: Record<Kategori, string> = {
  yaygin_market: 'Yaygın',
  market_markasi: 'Market',
  yoresel: 'Yöresel',
};

interface FilterPanelProps {
  /** Panel iki kez render ediliyor (masaüstü rayı + mobil şerit); radio
   *  grupları belge genelinde çakışmasın diye ad benzersiz olmalı. */
  instanceId: string;
  /** 'stack' masaüstü rayı, 'inline' mobil tek satır şeritleri. */
  layout?: 'stack' | 'inline';
  view: ViewMode;
  onChangeView: (v: ViewMode) => void;
  viewCounts: Record<ViewMode, number>;
  categories: Set<Kategori>;
  onToggleCategory: (k: Kategori) => void;
  onClearCategories: () => void;
  categoryCounts: Record<Kategori, number>;
}

export default function FilterPanel({
  instanceId,
  layout = 'stack',
  view, onChangeView, viewCounts,
  categories, onToggleCategory, onClearCategories, categoryCounts,
}: FilterPanelProps) {
  const inline = layout === 'inline';

  return (
    <div className={`filters filters-${layout}`}>
      {/* Tek seçim — radio */}
      <fieldset className="filter-group">
        <legend className="filter-legend">Görünüm</legend>
        <div className="filter-options">
          {VIEW_OPTIONS.map(opt => (
            <label key={opt.key} className={`opt opt-radio${view === opt.key ? ' is-on' : ''}`}>
              <input
                type="radio"
                name={`ayran-view-${instanceId}`}
                value={opt.key}
                checked={view === opt.key}
                onChange={() => onChangeView(opt.key)}
              />
              <span className="opt-mark" aria-hidden="true" />
              <span className="opt-label">{inline ? opt.short : opt.label}</span>
              {!inline && <span className="opt-count">{viewCounts[opt.key]}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Çoklu seçim — checkbox */}
      <fieldset className="filter-group">
        <legend className="filter-legend">
          Kategoriler
          {categories.size > 0 && (
            <button type="button" className="filter-clear" onClick={onClearCategories}>Temizle</button>
          )}
        </legend>
        <div className="filter-options">
          {kategoriler.map(kat => {
            const checked = categories.has(kat);
            return (
              <label
                key={kat}
                className={`opt opt-check${checked ? ' is-on' : ''}`}
                style={{ '--kat': KAT_COLOR[kat] } as React.CSSProperties}
              >
                <input type="checkbox" checked={checked} onChange={() => onToggleCategory(kat)} />
                <span className="opt-mark" aria-hidden="true" />
                <span className="opt-label">{inline ? KAT_SHORT[kat] : kategoriEtiketleri[kat]}</span>
                {!inline && <span className="opt-count">{categoryCounts[kat]}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
