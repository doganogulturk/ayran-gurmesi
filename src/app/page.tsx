'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { getAyranlar, createAyran, updateAyran, deleteAyran, updateAyranlarSira } from '../lib/ayranlar';
import AyranForm from '../components/AyranForm';

type ViewMode = 'grid' | 'list';

const KAT_COLOR: Record<Kategori, string> = {
  yaygin_market: 'var(--kat-yaygin)',
  market_markasi: 'var(--kat-market)',
  yoresel: 'var(--kat-yoresel)',
};

/* ── Card ─────────────────────────────────────────────── */
function AyranCard({
  item, onEdit, isSortingMode, onDragStart, onDragOver, onDrop, onMove, isFirst, isLast, orderNumber,
}: {
  item: AyranEntry;
  onEdit: (i: AyranEntry) => void;
  isSortingMode: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  orderNumber: number;
}) {
  return (
    <div
      className={`ayran-card${isSortingMode ? ' sorting-active' : ''}${item.eksi_mi ? ' eksi-card' : ''}`}
      draggable={isSortingMode}
      onClick={() => !isSortingMode && onEdit(item)}
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => onDragOver(e, item.id)}
      onDrop={() => onDrop(item.id)}
    >
      <div className="card-img-wrapper">
        <span className="card-order-badge">{orderNumber}</span>
        {item.fotograf_url ? (
          <img src={item.fotograf_url} className="card-img" alt={item.marka} />
        ) : (
          <div className="card-img-placeholder">
            <span style={{ fontSize: '2rem' }}>🥛</span>
            <span>Görsel yok</span>
          </div>
        )}

        {isSortingMode && (
          <div className="card-sort-overlay" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(item.id, 'up'); }}
              className="btn-sort"
              disabled={isFirst}
              title="Yukarı Taşı"
            >
              ▲
            </button>
            <div className="drag-handle-indicator">
              <span>⠿</span>
              <span style={{ fontSize: '0.65rem', marginTop: '-2px' }}>Sürükle</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(item.id, 'down'); }}
              className="btn-sort"
              disabled={isLast}
              title="Aşağı Taşı"
            >
              ▼
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        <div>
          <div className="card-title">{item.marka}</div>
          {item.urun_adi && <div className="card-subtitle">{item.urun_adi}</div>}
        </div>

        <div className="card-meta">
          {item.kategori === 'market_markasi' && item.market_adi && (
            <span className="card-meta-tag">🏪 {item.market_adi}</span>
          )}
          {item.kategori === 'yoresel' && item.yore && (
            <span className="card-meta-tag">📍 {item.yore}</span>
          )}
        </div>

        {item.notlar && <p className="card-notes">{item.notlar}</p>}
      </div>
    </div>
  );
}

/* ── List Row ─────────────────────────────────────────── */
function AyranListRow({
  item, onEdit, isSortingMode, onDragStart, onDragOver, onDrop, onMove, isFirst, isLast, orderNumber,
}: {
  item: AyranEntry;
  onEdit: (i: AyranEntry) => void;
  isSortingMode: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  orderNumber: number;
}) {
  return (
    <div
      className={`list-row${isSortingMode ? ' sorting-active' : ''}${item.eksi_mi ? ' eksi-row' : ''}`}
      draggable={isSortingMode}
      onClick={() => !isSortingMode && onEdit(item)}
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => onDragOver(e, item.id)}
      onDrop={() => onDrop(item.id)}
    >
      {isSortingMode && (
        <div className="list-sort-controls" onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onMove(item.id, 'up'); }}
            className="btn-sort-sm"
            disabled={isFirst}
            title="Yukarı Taşı"
          >
            ▲
          </button>
          <span className="drag-handle-sm" title="Sürükle">⠿</span>
          <button
            onClick={(e) => { e.stopPropagation(); onMove(item.id, 'down'); }}
            className="btn-sort-sm"
            disabled={isLast}
            title="Aşağı Taşı"
          >
            ▼
          </button>
        </div>
      )}

      <span className="list-order-number">{orderNumber}</span>

      {item.fotograf_url
        ? <img src={item.fotograf_url} className="list-img" alt={item.marka} />
        : <div className="list-img-placeholder">🥛</div>
      }

      <div className="list-info">
        <div className="list-title">
          {item.marka}{item.urun_adi ? ` — ${item.urun_adi}` : ''}
        </div>
        <div className="list-meta">
          {item.kategori === 'market_markasi' && item.market_adi && <span>🏪 {item.market_adi}</span>}
          {item.kategori === 'yoresel' && item.yore && <span>📍 {item.yore}</span>}
        </div>
      </div>

      {item.notlar && <span className="list-notes">{item.notlar}</span>}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Home() {
  const [ayrans, setAyrans] = useState<AyranEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>('grid');
  const [eksiFilter, setEksiFilter] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('ayran-theme') || 'dark';
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AyranEntry | null>(null);
  const [initialCategory, setInitialCategory] = useState<Kategori | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setAyrans(await getAyranlar());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ayran-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSave = async (entry: AyranEntry) => {
    try {
      const { id, ...fields } = entry;
      if (editingItem) {
        const updated = await updateAyran(id, fields);
        setAyrans(prev => prev.map(a => a.id === id ? updated : a));
      } else {
        const created = await createAyran(fields);
        setAyrans(prev => [created, ...prev]);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Hata: ' + message);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    const confirmed = window.confirm('Bu ayran kaydını silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    try {
      await deleteAyran(editingItem.id);
      setAyrans(prev => prev.filter(a => a.id !== editingItem.id));
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Silme işlemi sırasında hata oluştu: ' + message);
    }
  };

  // ── Sıralama yardımcıları ──────────────────────────────
  const saveSira = async (reordered: AyranEntry[]) => {
    setIsSaving(true);
    try {
      const updates = reordered.map((a, i) => ({ id: a.id, sira: i }));
      await updateAyranlarSira(updates);
      setAyrans(prev => {
        const byId: Record<string, number> = {};
        updates.forEach(u => { byId[u.id] = u.sira; });
        return prev.map(a => ({ ...a, sira: byId[a.id] ?? a.sira }));
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Sıralama kaydedilemedi: ' + message);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const reorderInKat = (kat: Kategori, fromId: string, toId: string) => {
    if (fromId === toId) return;
    const katItems = [...ayrans].filter(a => a.kategori === kat)
      .sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const fromIdx = katItems.findIndex(a => a.id === fromId);
    const toIdx = katItems.findIndex(a => a.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const moved = katItems.splice(fromIdx, 1)[0];
    katItems.splice(toIdx, 0, moved);
    saveSira(katItems);
  };

  const moveInKat = (kat: Kategori, id: string, dir: 'up' | 'down') => {
    const katItems = [...ayrans].filter(a => a.kategori === kat)
      .sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0) || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const idx = katItems.findIndex(a => a.id === id);
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= katItems.length) return;
    const arr = [...katItems];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    saveSira(arr);
  };

  // Filtre + sıralama
  const filtered = ayrans.filter(a => {
    return (!eksiFilter || a.eksi_mi);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (isSortingMode) {
      const siaDiff = (a.sira ?? 0) - (b.sira ?? 0);
      if (siaDiff !== 0) return siaDiff;
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  // İstatistikler
  const total = ayrans.length;
  const eksiCount = ayrans.filter(a => a.eksi_mi).length;

  const katCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const eksiKatCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k && a.eksi_mi).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const kategoriChartLabels: Record<Kategori, string> = {
    yaygin_market: 'Yaygın Market',
    market_markasi: 'Market Markası',
    yoresel: 'Yöresel Marka',
  };

  // Kategori bazlı gruplama
  const byKategori = kategoriler.map(kat => ({
    kat,
    items: sorted.filter(a => a.kategori === kat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-icon">🥛</div>
          <div className="logo-text">
            <h1>Ayran Gurmesi</h1>
            <p>Kişisel Ayran Derecelendirme Defteri</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-ghost" onClick={toggleTheme} title="Tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={load} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.82rem' }}>Tekrar dene</button>
        </div>
      )}

      {/* Dashboard */}
      <div className="dashboard">
        <div className="kpi-card">
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Toplam Kayıt</span>
            </div>
            <span className="kpi-total">{total}</span>
          </div>

          <div className="kpi-bar-stack">
            <div className="kpi-bar-track">
              {kategoriler.map(kat => {
                const count = katCounts[kat];
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div
                    key={kat}
                    className="kpi-bar-segment"
                    style={{ width: `${pct}%`, background: KAT_COLOR[kat] }}
                  >
                    {count > 0 && <span className="kpi-bar-segment-label">{count}</span>}
                  </div>
                );
              })}
            </div>

            <div className="kpi-bar-legends">
              {kategoriler.map(kat => (
                <div key={kat} className="kpi-legend-item">
                  <span className="kpi-legend-dot" style={{ background: KAT_COLOR[kat] }} />
                  <span>{kategoriChartLabels[kat]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Ekşi Ayran</span>
            </div>
            <span className="kpi-total">{eksiCount}</span>
          </div>

          <div className="kpi-bar-stack">
            <div className="kpi-bar-track">
              {kategoriler.map(kat => {
                const count = eksiKatCounts[kat];
                const pct = eksiCount ? (count / eksiCount) * 100 : 0;
                return (
                  <div
                    key={kat}
                    className="kpi-bar-segment"
                    style={{ width: `${pct}%`, background: KAT_COLOR[kat] }}
                  >
                    {count > 0 && <span className="kpi-bar-segment-label">{count}</span>}
                  </div>
                );
              })}
            </div>

            <div className="kpi-bar-legends">
              {kategoriler.map(kat => (
                <div key={kat} className="kpi-legend-item">
                  <span className="kpi-legend-dot" style={{ background: KAT_COLOR[kat] }} />
                  <span>{kategoriChartLabels[kat]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button
          className={`btn-sort-toggle${isSortingMode ? ' active' : ''}`}
          onClick={() => setIsSortingMode(p => !p)}
          title={isSortingMode ? 'Sıralamayı Kilitle' : 'Sıralamayı Düzenle'}
        >
          {isSortingMode ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Kilitle
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
              </svg>
              Sıralamayı Düzenle
            </>
          )}
        </button>

        <button
          className={`eksi-chip ${eksiFilter ? 'active' : ''}`}
          onClick={() => setEksiFilter(p => !p)}
        >
          🍋 Sadece Ekşi
        </button>

        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            title="Kart görünümü"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="Liste görünümü"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>
          </button>
        </div>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="empty-state">
          <span className="empty-icon">⏳</span>
          <p>Veriler yükleniyor…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🥛</span>
          <p style={{ fontWeight: 600 }}>Kayıt bulunamadı</p>
          <p style={{ fontSize: '0.85rem' }}>
            {total === 0 ? 'Henüz ayran eklenmedi.' : 'Filtreye uyan sonuç yok.'}
          </p>
        </div>
      ) : (
        byKategori.map(({ kat, items }) => (
          <section key={kat} className="cat-section" style={{ borderLeft: `4px solid ${KAT_COLOR[kat]}` }}>
            {/* Kategori başlığı */}
            <div className="cat-section-header">
              <span className="cat-badge">{kategoriEtiketleri[kat]}</span>
              <div className="cat-header-actions">
                <span className="cat-count">{items.length} kayıt</span>
                <button
                  type="button"
                  className="cat-add-btn"
                  onClick={() => { setEditingItem(null); setInitialCategory(kat); setIsFormOpen(true); }}
                  title={`${kategoriEtiketleri[kat]} için yeni ayran ekle`}
                >
                  + Ayran Ekle
                </button>
              </div>
            </div>

            {/* Grid ya da Liste */}
            {view === 'grid' ? (
              <div className="cards-grid">
                {items.map((item, idx) => (
                  <AyranCard
                    key={item.id}
                    item={item}
                    orderNumber={idx + 1}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    isSortingMode={isSortingMode}
                    onDragStart={id => setDragId(id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={toId => { if (dragId) reorderInKat(kat, dragId, toId); setDragId(null); }}
                    onMove={(id, dir) => moveInKat(kat, id, dir)}
                    isFirst={idx === 0}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="list-view">
                {items.map((item, idx) => (
                  <AyranListRow
                    key={item.id}
                    item={item}
                    orderNumber={idx + 1}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    isSortingMode={isSortingMode}
                    onDragStart={id => setDragId(id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={toId => { if (dragId) reorderInKat(kat, dragId, toId); setDragId(null); }}
                    onMove={(id, dir) => moveInKat(kat, id, dir)}
                    isFirst={idx === 0}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        ))
      )}

      {/* Karşılaştırma */}
      {/* Sıralama Kaydediliyor Toast */}
      {isSaving && (
        <div className="saving-toast">
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Sıralama kaydediliyor…
        </div>
      )}

      <AyranForm
        key={`${editingItem?.id ?? 'new'}-${initialCategory ?? 'default'}-${isFormOpen ? 'open' : 'closed'}`}
        isOpen={isFormOpen}
        editingItem={editingItem}
        initialCategory={initialCategory ?? undefined}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); setInitialCategory(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
