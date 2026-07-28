'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useMemo } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { getAyranlar, createAyran, updateAyran, deleteAyran, updateAyranlarSira } from '../lib/ayranlar';
import AyranForm from '../components/AyranForm';

type DashboardTab = 'hepsi' | 'eksi' | 'tatli';

const KAT_COLOR: Record<Kategori, string> = {
  yaygin_market: 'var(--kat-yaygin)',
  market_markasi: 'var(--kat-market)',
  yoresel: 'var(--kat-yoresel)',
};

const kategoriChartLabels: Record<Kategori, string> = {
  yaygin_market: 'Yaygın',
  market_markasi: 'Market Markası',
  yoresel: 'Yöresel',
};

const getBrandInitials = (marka: string | null | undefined) => {
  const words = (marka || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A';
  const initials = words.slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('');
  return initials || 'A';
};

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

        {item.eksi_mi && <span className="eksi-badge">Ekşi</span>}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Home() {
  const [ayrans, setAyrans] = useState<AyranEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategories, setActiveCategories] = useState<Set<Kategori>>(new Set());
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('hepsi');
  const [isSortingMode, setIsSortingMode] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AyranEntry | null>(null);
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

  /* ── Filtering & Sorting ─────────────────────────────── */
  const getFilteredItems = (
    source: AyranEntry[],
    tab: DashboardTab,
    cats: Set<Kategori>
  ): AyranEntry[] => {
    let items = [...source];
    if (tab === 'eksi') items = items.filter(i => i.eksi_mi);
    if (tab === 'tatli') items = items.filter(i => !i.eksi_mi);
    if (cats.size > 0) items = items.filter(i => cats.has(i.kategori));
    return items.sort((a, b) => {
      const diff = (a.sira ?? 9999) - (b.sira ?? 9999);
      if (diff !== 0) return diff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const hasActiveFilters = dashboardTab !== 'hepsi' || activeCategories.size > 0;

  const filteredItems = useMemo(
    () => getFilteredItems(ayrans, dashboardTab, activeCategories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ayrans, dashboardTab, activeCategories]
  );

  const toggleCategory = (kat: Kategori) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(kat)) next.delete(kat);
      else next.add(kat);
      return next;
    });
    setIsSortingMode(false);
  };

  const selectDashboardTab = (tab: DashboardTab) => {
    setDashboardTab(tab);
    setIsSortingMode(false);
  };

  /* ── Reordering (global sira) ──────────────────────── */
  const reorderItems = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setAyrans(prev => {
      const sorted = [...prev].sort((a, b) => {
        const diff = (a.sira ?? 9999) - (b.sira ?? 9999);
        if (diff !== 0) return diff;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      const fromIdx = sorted.findIndex(i => i.id === fromId);
      const toIdx = sorted.findIndex(i => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const moved = sorted.splice(fromIdx, 1)[0];
      sorted.splice(toIdx, 0, moved);
      return sorted.map((item, idx) => ({ ...item, sira: idx }));
    });
  };

  const moveItem = (id: string, dir: 'up' | 'down') => {
    setAyrans(prev => {
      const sorted = [...prev].sort((a, b) => {
        const diff = (a.sira ?? 9999) - (b.sira ?? 9999);
        if (diff !== 0) return diff;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      const idx = sorted.findIndex(i => i.id === id);
      if (idx < 0) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= sorted.length) return prev;
      [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
      return sorted.map((item, i) => ({ ...item, sira: i }));
    });
  };

  const saveCurrentSorting = async () => {
    const sorted = [...ayrans].sort((a, b) => {
      const diff = (a.sira ?? 9999) - (b.sira ?? 9999);
      if (diff !== 0) return diff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    const updates = sorted.map((item, index) => ({ id: item.id, sira: index }));
    if (updates.length === 0) return;

    setIsSaving(true);
    try {
      await updateAyranlarSira(updates);
      setAyrans(sorted.map((item, i) => ({ ...item, sira: i })));
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

  // İstatistikler & Dağılım Grafikleri
  const total = ayrans.length;
  const eksiCount = ayrans.filter(a => a.eksi_mi).length;
  const tatliCount = total - eksiCount;

  const katCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const eksiKatCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k && a.eksi_mi).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const tatliKatCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k && !a.eksi_mi).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const currentDashboardCount = dashboardTab === 'hepsi' ? total : (dashboardTab === 'eksi' ? eksiCount : tatliCount);
  const currentKatCounts = dashboardTab === 'hepsi' ? katCounts : (dashboardTab === 'eksi' ? eksiKatCounts : tatliKatCounts);

  // Formdaki initialCategory: tek kategori seçiliyse onu kullan
  const formInitialCategory: Kategori = activeCategories.size === 1
    ? [...activeCategories][0]
    : 'yaygin_market';

  return (
    <div className="app-container">
      {/* Header (Logo + Ekle & Sırala Eylemleri) */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-text">
            <h1>Ayran Gurmesi</h1>
            <p>Kişisel Ayran Derecelendirme Defteri</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`toolbar-btn${isSortingMode ? ' active' : ''}`}
            onClick={async () => {
              if (isSortingMode) {
                await saveCurrentSorting();
                setIsSortingMode(false);
              } else {
                setIsSortingMode(true);
              }
            }}
            title={hasActiveFilters ? 'Sıralama için tüm filtreleri kaldırın' : (isSortingMode ? 'Sıralamayı Kaydet' : 'Sırala')}
            disabled={isSaving || (hasActiveFilters && !isSortingMode)}
          >
            {isSortingMode ? '✓ Kaydet' : '↕ Sırala'}
          </button>
          <button
            type="button"
            className="cat-add-btn"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            title="Yeni ayran ekle"
          >
            + Ekle
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

      {/* Interaktif Dashboard KPI Dağılım Grafiği (Filtreleyen Sekmeli) */}
      <div className="dashboard">
        <div className="kpi-card single-kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-tabs" role="tablist" aria-label="Grafik Sekmeleri">
              <button
                type="button"
                className={`kpi-tab${dashboardTab === 'hepsi' ? ' active' : ''}`}
                onClick={() => selectDashboardTab('hepsi')}
                role="tab"
                aria-selected={dashboardTab === 'hepsi'}
              >
                Tüm Kayıtlar
              </button>
              <button
                type="button"
                className={`kpi-tab${dashboardTab === 'eksi' ? ' active' : ''}`}
                onClick={() => selectDashboardTab('eksi')}
                role="tab"
                aria-selected={dashboardTab === 'eksi'}
              >
                Ekşiler
              </button>
              <button
                type="button"
                className={`kpi-tab${dashboardTab === 'tatli' ? ' active' : ''}`}
                onClick={() => selectDashboardTab('tatli')}
                role="tab"
                aria-selected={dashboardTab === 'tatli'}
              >
                Ekşi Olmayanlar
              </button>
            </div>
          </div>

          <div className="kpi-bar-stack">
            <div className="kpi-bar-row">
              <span className="kpi-bar-total" title="Toplam Kayıt">{currentDashboardCount}</span>
              <div className="kpi-bar-track">
                {kategoriler.map(kat => {
                  const count = currentKatCounts[kat];
                  const pct = currentDashboardCount ? (count / currentDashboardCount) * 100 : 0;
                  return (
                    <div
                      key={kat}
                      className="kpi-bar-segment"
                      style={{ width: `${pct}%`, background: KAT_COLOR[kat] }}
                      title={`${kategoriChartLabels[kat]}: ${count}`}
                    >
                      {count > 0 && <span className="kpi-bar-segment-label">{count}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interaktif Kategori Legend Butonları */}
            <div className="kpi-bar-legends">
              {kategoriler.map(kat => {
                const isSelected = activeCategories.has(kat);
                return (
                  <button
                    key={kat}
                    type="button"
                    className={`kpi-legend-btn${isSelected ? ' active' : ''}`}
                    onClick={() => toggleCategory(kat)}
                    title={`${kategoriChartLabels[kat]} kategorisini filtrele`}
                  >
                    <span className="kpi-legend-dot" style={{ background: KAT_COLOR[kat] }} />
                    <span>{kategoriChartLabels[kat]}</span>
                  </button>
                );
              })}
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
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
          >
            İlk Ayranı Ekle
          </button>
        </div>
      ) : (
        <>
          {/* Sadece Liste Görünümü */}
          <div className="list-view">
            {filteredItems.map((item, idx) => (
              <AyranListRow
                key={item.id}
                item={item}
                orderNumber={idx + 1}
                onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                isSortingMode={isSortingMode}
                onDragStart={id => setDragId(id)}
                onDragOver={e => e.preventDefault()}
                onDrop={toId => { if (dragId) reorderItems(dragId, toId); setDragId(null); }}
                onMove={(id, dir) => moveItem(id, dir)}
                isFirst={idx === 0}
                isLast={idx === filteredItems.length - 1}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p style={{ fontWeight: 600 }}>Sonuç bulunamadı</p>
              <p style={{ fontSize: '0.85rem' }}>Seçili filtrelere uyan ayran yok.</p>
            </div>
          )}
        </>
      )}

      {/* Sıralama Kaydediliyor Toast */}
      {isSaving && (
        <div className="saving-toast">
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Sıralama kaydediliyor…
        </div>
      )}

      <AyranForm
        key={`${editingItem?.id ?? 'new'}-${isFormOpen ? 'open' : 'closed'}`}
        isOpen={isFormOpen}
        editingItem={editingItem}
        initialCategory={formInitialCategory}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
