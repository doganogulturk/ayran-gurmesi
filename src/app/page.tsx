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

const getBrandInitials = (marka: string | null | undefined) => {
  const words = (marka || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A';
  const initials = words.slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('');
  return initials || 'A';
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
    <div className="card-with-order">
      <span className="item-order-number">{orderNumber}</span>
      <div
        className={`ayran-card${isSortingMode ? ' sorting-active' : ''}`}
        draggable={isSortingMode}
        onClick={() => !isSortingMode && onEdit(item)}
        onDragStart={() => onDragStart(item.id)}
        onDragOver={(e) => onDragOver(e, item.id)}
        onDrop={() => onDrop(item.id)}
      >
        {item.eksi_mi && <span className="eksi-badge">🍋 Ekşi</span>}
        <div className="card-img-wrapper">
          {item.fotograf_url ? (
            <img src={item.fotograf_url} className="card-img" alt={item.marka} />
          ) : (
            <div className="card-img-placeholder">
              <span className="card-initials">{getBrandInitials(item.marka)}</span>
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
        </div>
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
    <div className="list-row-with-order">
      <span className="item-order-number">{orderNumber}</span>
      <div
        className={`list-row${isSortingMode ? ' sorting-active' : ''}`}
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

        {item.fotograf_url
          ? <img src={item.fotograf_url} className="list-img" alt={item.marka} />
          : <div className="list-img-placeholder"><span className="list-initials">{getBrandInitials(item.marka)}</span></div>
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

        {item.eksi_mi && <span className="eksi-badge">🍋 Ekşi</span>}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Home() {
  const [ayrans, setAyrans] = useState<AyranEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>('list');
  const [activeCategory, setActiveCategory] = useState<Kategori>('yaygin_market');
  const [eksiFilter, setEksiFilter] = useState<'hepsi' | 'eksi' | 'tatli'>('hepsi');
  const [isSortingMode, setIsSortingMode] = useState(false);

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

  const getSectionItems = (source: AyranEntry[], category: Kategori, filterVal: 'hepsi' | 'eksi' | 'tatli') => {
    const items = source.filter(item => {
      if (item.kategori !== category) return false;
      if (filterVal === 'eksi') return item.eksi_mi;
      if (filterVal === 'tatli') return !item.eksi_mi;
      return true;
    });
    const isEksi = filterVal === 'eksi';
    return [...items].sort((a, b) => {
      const sortingValueA = isEksi ? (a.sira_eksi ?? 0) : (a.sira ?? 0);
      const sortingValueB = isEksi ? (b.sira_eksi ?? 0) : (b.sira ?? 0);
      const valueDiff = sortingValueA - sortingValueB;
      if (valueDiff !== 0) return valueDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const applySectionOrder = (source: AyranEntry[], category: Kategori, filterVal: 'hepsi' | 'eksi' | 'tatli', orderedItems: AyranEntry[]) => {
    const orderMap = new Map(orderedItems.map((item, index) => [item.id, index]));
    const isEksi = filterVal === 'eksi';
    return source.map(item => {
      if (item.kategori !== category) return item;
      if (filterVal === 'eksi' && !item.eksi_mi) return item;
      if (filterVal === 'tatli' && item.eksi_mi) return item;
      const order = orderMap.get(item.id);
      if (order === undefined) return item;
      return {
        ...item,
        ...(isEksi ? { sira_eksi: order } : { sira: order }),
      };
    });
  };

  const reorderSectionItems = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setAyrans(prev => {
      const sectionItems = getSectionItems(prev, activeCategory, eksiFilter);
      const fromIdx = sectionItems.findIndex(item => item.id === fromId);
      const toIdx = sectionItems.findIndex(item => item.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const moved = sectionItems.splice(fromIdx, 1)[0];
      sectionItems.splice(toIdx, 0, moved);
      return applySectionOrder(prev, activeCategory, eksiFilter, sectionItems);
    });
  };

  const moveSectionItem = (id: string, dir: 'up' | 'down') => {
    setAyrans(prev => {
      const sectionItems = getSectionItems(prev, activeCategory, eksiFilter);
      const idx = sectionItems.findIndex(item => item.id === id);
      if (idx < 0) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= sectionItems.length) return prev;
      const reordered = [...sectionItems];
      [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
      return applySectionOrder(prev, activeCategory, eksiFilter, reordered);
    });
  };

  const saveCurrentSorting = async () => {
    const isEksi = eksiFilter === 'eksi';
    const sectionItems = getSectionItems(ayrans, activeCategory, eksiFilter);
    if (sectionItems.length === 0) return;

    const updates: Array<{ id: string; sira?: number; sira_eksi?: number }> = sectionItems.map((item, index) => ({
      id: item.id,
      ...(isEksi ? { sira_eksi: index } : { sira: index }),
    }));

    setIsSaving(true);
    try {
      await updateAyranlarSira(updates);
      setAyrans(prev => prev.map(item => {
        const match = updates.find(update => update.id === item.id);
        if (!match) return item;
        return {
          ...item,
          ...(isEksi ? { sira_eksi: match.sira_eksi } : { sira: match.sira }),
        };
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Sıralama kaydedilemedi: ' + message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

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

  const activeSectionItems = getSectionItems(ayrans, activeCategory, eksiFilter);
  const activeSectionLabel = kategoriEtiketleri[activeCategory] + (eksiFilter === 'eksi' ? ' (Ekşi)' : (eksiFilter === 'tatli' ? ' (Ekşi Olmayan)' : ' (Tümü)'));

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-text">
            <h1>Ayran Gurmesi</h1>
            <p>Kişisel Ayran Derecelendirme Defteri</p>
          </div>
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

      {/* İçerik */}
      {loading ? (
        <div className="empty-state">
          <span className="empty-icon">⏳</span>
          <p>Veriler yükleniyor…</p>
        </div>
      ) : ayrans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🥛</span>
          <p style={{ fontWeight: 600 }}>Kayıt bulunamadı</p>
          <p style={{ fontSize: '0.85rem' }}>Henüz ayran eklenmedi. Ekle butonuyla yeni bir ayran kaydı ekleyin.</p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '14px' }}
            onClick={() => { setEditingItem(null); setInitialCategory('yaygin_market'); setIsFormOpen(true); }}
          >
            İlk Ayranı Ekle
          </button>
        </div>
      ) : (
        <>
          {/* Filtre Tablosu */}
          <div className="filter-grid">
            <div className="filter-row">
              {kategoriler.map(kat => (
                <button
                  key={kat}
                  type="button"
                  className={`filter-cell${activeCategory === kat ? ' active' : ''}`}
                  onClick={() => { setActiveCategory(kat); setIsSortingMode(false); }}
                  role="tab"
                  aria-selected={activeCategory === kat}
                >
                  {kategoriEtiketleri[kat]}
                </button>
              ))}
              <span className="filter-count">{activeSectionItems.length}</span>
            </div>
            <div className="filter-row">
              {([['hepsi', 'Tümü'], ['tatli', 'Ekşi Olmayan'], ['eksi', 'Ekşi Ayran']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`filter-cell${eksiFilter === val ? ' active' : ''}`}
                  onClick={() => { setEksiFilter(val); setIsSortingMode(false); }}
                  role="tab"
                  aria-selected={eksiFilter === val}
                >
                  {label}
                </button>
              ))}
              <span className="filter-count-spacer" />
            </div>
          </div>

          <section className="cat-section">
            <div className="cat-section-header">
              <div className="section-controls-row">
                <div className="section-controls-group">
                  <button
                    className={`btn-sort-toggle${isSortingMode ? ' active' : ''}`}
                    onClick={async () => {
                      if (isSortingMode) {
                        await saveCurrentSorting();
                        setIsSortingMode(false);
                      } else {
                        setIsSortingMode(true);
                      }
                    }}
                    title={isSortingMode ? 'Sıralamayı Kaydet' : 'Sırala'}
                    disabled={isSaving}
                  >
                    {isSortingMode ? 'Kaydet' : 'Sırala'}
                  </button>
                  <div className="view-toggle compact-view-toggle">
                    <button
                      className={`view-btn ${view === 'list' ? 'active' : ''}`}
                      onClick={() => setView('list')}
                      title="Liste görünümü"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>
                      <span className="view-btn-label">Liste</span>
                    </button>
                    <button
                      className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                      onClick={() => setView('grid')}
                      title="Kart görünümü"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      <span className="view-btn-label">Kart</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cat-add-btn"
                    onClick={() => {
                      setEditingItem(null);
                      setInitialCategory(activeCategory);
                      setIsFormOpen(true);
                    }}
                    title={`${activeSectionLabel} için yeni ayran ekle`}
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>

            {view === 'grid' ? (
              <div className="cards-grid">
                {activeSectionItems.map((item, idx) => (
                  <AyranCard
                    key={item.id}
                    item={item}
                    orderNumber={idx + 1}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    isSortingMode={isSortingMode}
                    onDragStart={id => setDragId(id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={toId => { if (dragId) reorderSectionItems(dragId, toId); setDragId(null); }}
                    onMove={(id, dir) => moveSectionItem(id, dir)}
                    isFirst={idx === 0}
                    isLast={idx === activeSectionItems.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="list-view">
                {activeSectionItems.map((item, idx) => (
                  <AyranListRow
                    key={item.id}
                    item={item}
                    orderNumber={idx + 1}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    isSortingMode={isSortingMode}
                    onDragStart={id => setDragId(id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={toId => { if (dragId) reorderSectionItems(dragId, toId); setDragId(null); }}
                    onMove={(id, dir) => moveSectionItem(id, dir)}
                    isFirst={idx === 0}
                    isLast={idx === activeSectionItems.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        </>
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
