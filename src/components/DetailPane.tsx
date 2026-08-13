'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useMemo, useState } from 'react';
import { AyranEntry, Kategori, kategoriEtiketleri } from '../types/ayran';
import { KAT_COLOR } from './FilterPanel';
import { brandColor, brandInitials } from './AyranRow';

type Scope = 'genel' | 'eksi' | 'tatli' | Kategori;

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'genel', label: 'Genel' },
  { key: 'yaygin_market', label: kategoriEtiketleri.yaygin_market },
  { key: 'market_markasi', label: kategoriEtiketleri.market_markasi },
  { key: 'yoresel', label: kategoriEtiketleri.yoresel },
  { key: 'eksi', label: 'Ekşi' },
  { key: 'tatli', label: 'Ekşi Değil' },
];

const matchesScope = (item: AyranEntry, scope: Scope) => {
  if (scope === 'genel') return true;
  if (scope === 'eksi') return item.eksi_mi;
  if (scope === 'tatli') return !item.eksi_mi;
  return item.kategori === scope;
};

interface DetailPaneProps {
  item: AyranEntry | null;
  rank: number | null;
  total: number;
  eksiCount: number;
  /** Sıraya dizilmiş tam liste — sekme podyumları ve son eklenenler buradan türetiliyor. */
  ranked: AyranEntry[];
  categoryCounts: Record<Kategori, number>;
  onEdit: (item: AyranEntry) => void;
  onDelete: (item: AyranEntry) => void;
  onSelect: (item: AyranEntry) => void;
  onClose: () => void;
}

function Thumb({ item, className }: { item: AyranEntry; className: string }) {
  return item.fotograf_url
    ? <img src={item.fotograf_url} className={className} alt="" />
    : (
      <span className={`${className} thumb-fallback`} style={{ background: brandColor(item.marka || '') }}>
        {brandInitials(item.marka)}
      </span>
    );
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '';

export default function DetailPane({
  item, rank, total, eksiCount, ranked, categoryCounts,
  onEdit, onDelete, onSelect, onClose,
}: DetailPaneProps) {
  const [scope, setScope] = useState<Scope>('genel');

  const podium = useMemo(
    () => ranked.filter(i => matchesScope(i, scope)).slice(0, 3),
    [ranked, scope]
  );

  // Son eklenenler de aktif sekmenin kapsamına göre daralıyor.
  const recent = useMemo(
    () => ranked
      .filter(i => i.created_at && matchesScope(i, scope))
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 3),
    [ranked, scope]
  );

  /* ── Bir kayıt seçili ─────────────────────────────── */
  if (item) {
    return (
      <div className="detail">
        <div className="detail-bar">
          {rank !== null && <span className="detail-rank">#{rank}</span>}
          <button type="button" className="detail-close" onClick={onClose} aria-label="Seçimi kaldır">✕</button>
        </div>

        <div className="detail-hero">
          <Thumb item={item} className="detail-photo" />
        </div>

        <div className="detail-body">
          <h2 className="detail-name">{item.marka}</h2>
          {item.urun_adi && <p className="detail-variant">{item.urun_adi}</p>}

          <div className="detail-chips">
            <span className="chip" style={{ '--chip': KAT_COLOR[item.kategori] } as React.CSSProperties}>
              {kategoriEtiketleri[item.kategori]}
            </span>
            {item.eksi_mi
              ? <span className="chip chip-sour">Ekşi</span>
              : <span className="chip chip-plain">Ekşi değil</span>}
          </div>

          <dl className="detail-facts">
            {item.kategori === 'market_markasi' && item.market_adi && (
              <div><dt>Market</dt><dd>{item.market_adi}</dd></div>
            )}
            {item.kategori === 'yoresel' && item.yore && (
              <div><dt>Yöre</dt><dd>{item.yore}</dd></div>
            )}
            {item.created_at && (
              <div>
                <dt>Eklendi</dt>
                <dd>{new Date(item.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="detail-actions">
          <button type="button" className="btn-danger" onClick={() => onDelete(item)}>Sil</button>
          <button type="button" className="btn-primary" onClick={() => onEdit(item)}>Düzenle</button>
        </div>
      </div>
    );
  }

  /* ── Seçim yok: genel bakış ───────────────────────── */
  return (
    <div className="detail detail-overview">
      <div className="overview-head">
        <p className="overview-eyebrow">Sıralaman</p>
        <h2 className="overview-title">
          {total > 0 ? `${total} ayran denedin` : 'Henüz kayıt yok'}
        </h2>
        {total > 0 && (
          <p className="overview-sub">{eksiCount} tanesi ekşi · {total - eksiCount} tanesi değil</p>
        )}
      </div>

      {total > 0 && (
        <>
          <div className="scope-tabs" role="tablist">
            {SCOPES.map(s => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={scope === s.key}
                className={`scope-tab${scope === s.key ? ' is-on' : ''}`}
                onClick={() => setScope(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {podium.length > 0 ? (
            <div className="podium">
              {podium.map((p, i) => (
                <button
                  type="button"
                  key={p.id}
                  className={`podium-slot podium-${i + 1}`}
                  onClick={() => onSelect(p)}
                >
                  <span className="podium-medal">{['🥇', '🥈', '🥉'][i]}</span>
                  <Thumb item={p} className="podium-thumb" />
                  <span className="podium-name">{p.marka}</span>
                  {p.urun_adi && <span className="podium-variant">{p.urun_adi}</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className="scope-empty">Bu grupta henüz kayıt yok.</p>
          )}

          <section className="pane-section">
            <h3 className="pane-section-title">Son Eklenenler</h3>
            {recent.length === 0 && <p className="scope-empty">Bu grupta kayıt yok.</p>}
            <div className="recent-list">
              {recent.map(r => (
                <button type="button" key={r.id} className="recent-item" onClick={() => onSelect(r)}>
                  <Thumb item={r} className="recent-thumb" />
                  <span className="recent-text">
                    <span className="recent-name">{r.marka}</span>
                    {r.urun_adi && <span className="recent-variant">{r.urun_adi}</span>}
                  </span>
                  <span className="recent-date">{formatDate(r.created_at)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="pane-section">
            <h3 className="pane-section-title">Kategori Dağılımı</h3>
            <div className="overview-breakdown">
              {(Object.keys(categoryCounts) as Kategori[]).map(kat => {
                const count = categoryCounts[kat];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div className="breakdown-row" key={kat}>
                    <span className="breakdown-label">
                      <i style={{ background: KAT_COLOR[kat] }} />
                      {kategoriEtiketleri[kat]}
                    </span>
                    <span className="breakdown-bar">
                      <span style={{ width: `${pct}%`, background: KAT_COLOR[kat] }} />
                    </span>
                    <span className="breakdown-value">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
