'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AyranEntry, Kategori, kategoriler, kategoriEtiketleri } from '../types/ayran';
import { getAyranlar, createAyran, updateAyran, deleteAyran, updateAyranlarSira } from '../lib/ayranlar';
import AyranForm from '../components/AyranForm';
import CompareModal from '../components/CompareModal';

type ViewMode = 'grid' | 'list';
type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'custom';

const KAT_COLOR: Record<Kategori, string> = {
  yaygin_market: 'var(--kat-yaygin)',
  market_markasi: 'var(--kat-market)',
  yoresel: 'var(--kat-yoresel)',
};

const KAT_DIM: Record<Kategori, string> = {
  yaygin_market: 'var(--blue-dim)',
  market_markasi: 'var(--amber-dim)',
  yoresel: 'var(--green-dim)',
};

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

/* ── Card ─────────────────────────────────────────────── */
function AyranCard({
  item, onEdit, onDelete, onCompareToggle, isChecked,
  isSortingMode, onDragStart, onDragOver, onDrop, onMove, isFirst, isLast,
}: {
  item: AyranEntry;
  onEdit: (i: AyranEntry) => void;
  onDelete: (id: string) => void;
  onCompareToggle: (id: string, v: boolean) => void;
  isChecked: boolean;
  isSortingMode: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const color = KAT_COLOR[item.kategori];
  return (
    <div
      className={`ayran-card ${isSortingMode ? 'sorting-active' : ''}`}
      style={{ '--card-color': color } as React.CSSProperties}
      draggable={isSortingMode}
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => onDragOver(e, item.id)}
      onDrop={() => onDrop(item.id)}
    >
      <div className="card-img-wrapper">
        {item.fotograf_url ? (
          <img src={item.fotograf_url} className="card-img" alt={item.marka} />
        ) : (
          <div className="card-img-placeholder">
            <span style={{ fontSize: '2rem' }}>🥛</span>
            <span>Görsel yok</span>
          </div>
        )}
        {item.eksi_mi && <span className="card-badge-eksi">🍋 Ekşi</span>}

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
          {item.icme_tarihi && (
            <span className="card-meta-tag">📅 {formatDate(item.icme_tarihi)}</span>
          )}
        </div>

        {item.notlar && <p className="card-notes">{item.notlar}</p>}
      </div>

      <div className="card-footer">
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={e => onCompareToggle(item.id, e.target.checked)}
            disabled={isSortingMode}
          />
          Karşılaştır
        </label>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={() => onEdit(item)} className="btn btn-ghost" title="Düzenle" disabled={isSortingMode}>✏️</button>
          <button onClick={() => onDelete(item.id)} className="btn btn-danger-ghost" title="Sil" disabled={isSortingMode}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

/* ── List Row ─────────────────────────────────────────── */
function AyranListRow({
  item, onEdit, onDelete, onCompareToggle, isChecked,
  isSortingMode, onDragStart, onDragOver, onDrop, onMove, isFirst, isLast,
}: {
  item: AyranEntry;
  onEdit: (i: AyranEntry) => void;
  onDelete: (id: string) => void;
  onCompareToggle: (id: string, v: boolean) => void;
  isChecked: boolean;
  isSortingMode: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const color = KAT_COLOR[item.kategori];
  return (
    <div
      className={`list-row ${isSortingMode ? 'sorting-active' : ''}`}
      style={{ '--card-color': color } as React.CSSProperties}
      draggable={isSortingMode}
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
        : <div className="list-img-placeholder">🥛</div>
      }

      <div className="list-info">
        <div className="list-title">{item.marka}{item.urun_adi ? ` — ${item.urun_adi}` : ''}</div>
        <div className="list-meta">
          {item.kategori === 'market_markasi' && item.market_adi && <span>🏪 {item.market_adi}</span>}
          {item.kategori === 'yoresel' && item.yore && <span>📍 {item.yore}</span>}
          {item.icme_tarihi && <span>📅 {formatDate(item.icme_tarihi)}</span>}
        </div>
      </div>

      {item.notlar && <span className="list-notes">{item.notlar}</span>}

      {item.eksi_mi && <span className="eksi-badge-sm">🍋 Ekşi</span>}

      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => onCompareToggle(item.id, e.target.checked)}
          style={{ accentColor: 'var(--blue)', width: '14px', height: '14px' }}
          disabled={isSortingMode}
        />
      </label>

      <div className="list-actions">
        <button onClick={() => onEdit(item)} className="btn btn-ghost" title="Düzenle" disabled={isSortingMode}>✏️</button>
        <button onClick={() => onDelete(item.id)} className="btn btn-danger-ghost" title="Sil" disabled={isSortingMode}>🗑️</button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Home() {
  const [ayrans, setAyrans] = useState<AyranEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [eksiFilter, setEksiFilter] = useState(false);
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [theme, setTheme] = useState('dark');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AyranEntry | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAyrans(await getAyranlar());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const t = localStorage.getItem('ayran-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    load();
  }, [load]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ayran-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSave = async (entry: AyranEntry) => {
    try {
      const { id, created_at, ...fields } = entry;
      if (editingItem) {
        const updated = await updateAyran(id, fields);
        setAyrans(prev => prev.map(a => a.id === id ? updated : a));
      } else {
        const created = await createAyran(fields);
        setAyrans(prev => [created, ...prev]);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteAyran(id);
      setAyrans(prev => prev.filter(a => a.id !== id));
      setCompareIds(prev => prev.filter(c => c !== id));
    } catch (e: any) {
      alert('Silme hatası: ' + e.message);
    }
  };

  const handleCompare = (id: string, checked: boolean) => {
    if (checked) {
      if (compareIds.length >= 3) { alert('En fazla 3 ayran karşılaştırılabilir.'); return; }
      setCompareIds(prev => [...prev, id]);
    } else {
      setCompareIds(prev => prev.filter(c => c !== id));
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
    } catch (e: any) {
      alert('Sıralama kaydedilemedi: ' + e.message);
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
    const q = search.toLowerCase();
    const match = !q ||
      a.marka.toLowerCase().includes(q) ||
      (a.urun_adi || '').toLowerCase().includes(q) ||
      (a.notlar || '').toLowerCase().includes(q) ||
      (a.yore || '').toLowerCase().includes(q) ||
      (a.market_adi || '').toLowerCase().includes(q);
    return match && (!eksiFilter || a.eksi_mi);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (isSortingMode || sort === 'custom') {
      // Özel sıralama: sira alanına göre, eşitse created_at'a göre
      const siaDiff = (a.sira ?? 0) - (b.sira ?? 0);
      if (siaDiff !== 0) return siaDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sort === 'name-asc') return a.marka.localeCompare(b.marka, 'tr');
    if (sort === 'name-desc') return b.marka.localeCompare(a.marka, 'tr');
    if (sort === 'date-asc') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  // İstatistikler
  const total = ayrans.length;
  const uniqueMarkas = new Set(ayrans.map(a => a.marka)).size;
  const eksiCount = ayrans.filter(a => a.eksi_mi).length;

  const katCounts = kategoriler.reduce((acc, k) => {
    acc[k] = ayrans.filter(a => a.kategori === k).length;
    return acc;
  }, {} as Record<Kategori, number>);

  const favKat = kategoriler.reduce((best, k) =>
    katCounts[k] > katCounts[best] ? k : best, kategoriler[0]);

  // Kategori bazlı gruplama
  const byKategori = kategoriler.map(kat => ({
    kat,
    items: sorted.filter(a => a.kategori === kat),
  })).filter(g => g.items.length > 0);

  const compareItems = ayrans.filter(a => compareIds.includes(a.id));

  if (!isMounted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
        <span>Yükleniyor…</span>
      </div>
    );
  }

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
          <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5v14"/></svg>
            Ayran Ekle
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
        <div className="stat-card" style={{ '--card-accent': 'var(--blue)' } as React.CSSProperties}>
          <span className="stat-label">Toplam Kayıt</span>
          <span className="stat-value">{total}</span>
          <span className="stat-sub">{uniqueMarkas} farklı marka</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--amber)' } as React.CSSProperties}>
          <span className="stat-label">Ekşi Ayran</span>
          <span className="stat-value">{eksiCount}</span>
          <span className="stat-sub">%{total ? Math.round(eksiCount / total * 100) : 0} oranında</span>
        </div>
        {kategoriler.map(kat => (
          <div
            key={kat}
            className="stat-card"
            style={{ '--card-accent': KAT_COLOR[kat] } as React.CSSProperties}
          >
            <span className="stat-label">{kategoriEtiketleri[kat]}</span>
            <span className="stat-value">{katCounts[kat]}</span>
            <span className="stat-sub">
              {katCounts[kat] > 0 && kat === favKat ? '👑 En çok' : 'kayıt'}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            className="search-input"
            placeholder="Marka, yöre, notlarda ara…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={isSortingMode ? 'custom' : sort}
          onChange={e => { setIsSortingMode(false); setSort(e.target.value as SortOption); }}
          disabled={isSortingMode}
        >
          <option value="date-desc">En Yeni</option>
          <option value="date-asc">En Eski</option>
          <option value="name-asc">Marka A→Z</option>
          <option value="name-desc">Marka Z→A</option>
          <option value="custom">Özel Sıralama</option>
        </select>

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
          <section key={kat} className="cat-section">
            {/* Kategori başlığı */}
            <div className="cat-section-header">
              <span
                className="cat-badge"
                style={{
                  background: KAT_DIM[kat],
                  color: KAT_COLOR[kat],
                  border: `1px solid ${KAT_COLOR[kat]}44`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: KAT_COLOR[kat], display: 'inline-block' }} />
                {kategoriEtiketleri[kat]}
              </span>
              <span className="cat-count">{items.length} kayıt</span>
            </div>

            {/* Grid ya da Liste */}
            {view === 'grid' ? (
              <div className="cards-grid">
                {items.map((item, idx) => (
                  <AyranCard
                    key={item.id}
                    item={item}
                    isChecked={compareIds.includes(item.id)}
                    onCompareToggle={handleCompare}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    onDelete={handleDelete}
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
                    isChecked={compareIds.includes(item.id)}
                    onCompareToggle={handleCompare}
                    onEdit={i => { setEditingItem(i); setIsFormOpen(true); }}
                    onDelete={handleDelete}
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
      {!isSortingMode && compareIds.length >= 2 && (
        <button
          className="btn btn-primary compare-trigger-btn"
          onClick={() => setIsCompareOpen(true)}
        >
          ⚖️ Karşılaştır ({compareIds.length})
        </button>
      )}

      {/* Sıralama Kaydediliyor Toast */}
      {isSaving && (
        <div className="saving-toast">
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Sıralama kaydediliyor…
        </div>
      )}

      <AyranForm
        isOpen={isFormOpen}
        editingItem={editingItem}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSave={handleSave}
      />

      <CompareModal
        isOpen={isCompareOpen}
        compareItems={compareItems}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
