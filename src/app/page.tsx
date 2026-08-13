'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { AyranEntry, Kategori, kategoriler } from '../types/ayran';
import {
  getAyranlar, createAyran, updateAyran, deleteAyran, updateAyranlarSira, deleteFotograf,
} from '../lib/ayranlar';
import { sortAyranlar } from '../lib/sort';
import { useIsDesktop } from '../hooks/useIsDesktop';
import FilterPanel, { ViewMode } from '../components/FilterPanel';
import { StaticRow, DraggableRow } from '../components/AyranRow';
import DetailPane from '../components/DetailPane';
import AyranForm from '../components/AyranForm';

const VIEW_TITLE: Record<ViewMode, string> = {
  hepsi: 'Tüm Kayıtlar',
  eksi: 'Ekşiler',
  tatli: 'Ekşi Olmayanlar',
};

export default function Home() {
  const isDesktop = useIsDesktop();

  const [ayrans, setAyrans] = useState<AyranEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>('hepsi');
  const [categories, setCategories] = useState<Set<Kategori>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AyranEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  /* ── Derived data ────────────────────────────────── */
  const ranked = useMemo(() => sortAyranlar(ayrans), [ayrans]);

  const visible = useMemo(() => {
    let items = ranked;
    if (view === 'eksi') items = items.filter(i => i.eksi_mi);
    if (view === 'tatli') items = items.filter(i => !i.eksi_mi);
    if (categories.size > 0) items = items.filter(i => categories.has(i.kategori));
    return items;
  }, [ranked, view, categories]);

  const canReorder = view === 'hepsi' && categories.size === 0;

  const total = ayrans.length;
  const eksiCount = ayrans.filter(a => a.eksi_mi).length;
  const viewCounts: Record<ViewMode, number> = {
    hepsi: total, eksi: eksiCount, tatli: total - eksiCount,
  };

  const categoryCounts = useMemo(() => {
    const base = kategoriler.reduce((acc, k) => { acc[k] = 0; return acc; }, {} as Record<Kategori, number>);
    let source = ayrans;
    if (view === 'eksi') source = source.filter(a => a.eksi_mi);
    if (view === 'tatli') source = source.filter(a => !a.eksi_mi);
    for (const a of source) base[a.kategori]++;
    return base;
  }, [ayrans, view]);

  const selectedItem = selectedId ? ayrans.find(a => a.id === selectedId) ?? null : null;
  const selectedRank = selectedItem ? ranked.findIndex(a => a.id === selectedItem.id) + 1 : null;

  /* ── Interactions ────────────────────────────────── */
  const toggleCategory = (kat: Kategori) => {
    setCategories(prev => {
      const next = new Set(prev);
      if (next.has(kat)) next.delete(kat); else next.add(kat);
      return next;
    });
  };

  // Masaüstünde satıra tıklamak detayı açar, mobilde doğrudan düzenlemeye gider.
  const handleRowSelect = (item: AyranEntry) => {
    if (isDesktop) {
      setSelectedId(prev => (prev === item.id ? null : item.id));
    } else {
      setEditingItem(item);
      setIsFormOpen(true);
    }
  };

  const persistSira = async (list: AyranEntry[]) => {
    setIsSaving(true);
    try {
      await updateAyranlarSira(list.map(i => ({ id: i.id, sira: i.sira ?? 0 })));
    } catch (e: unknown) {
      alert('Sıralama kaydedilemedi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setAyrans(prev => {
      const sorted = sortAyranlar(prev);
      const from = sorted.findIndex(i => i.id === active.id);
      const to = sorted.findIndex(i => i.id === over.id);
      if (from === -1 || to === -1) return prev;
      const next = arrayMove(sorted, from, to).map((item, idx) => ({ ...item, sira: idx }));
      void persistSira(next);
      return next;
    });
  };

  /* ── CRUD ────────────────────────────────────────── */
  const handleSave = async (entry: AyranEntry, targetIndex?: number) => {
    try {
      const { id, ...fields } = entry;
      if (editingItem) {
        const oldPhoto = editingItem.fotograf_url;
        const updated = await updateAyran(id, fields);
        if (oldPhoto && oldPhoto !== updated.fotograf_url) void deleteFotograf(oldPhoto);
        setAyrans(prev => prev.map(a => (a.id === id ? updated : a)));
      } else {
        const created = await createAyran(fields);
        const list = [...sortAyranlar(ayrans)];
        list.splice(targetIndex !== undefined && targetIndex >= 0 ? targetIndex : 0, 0, created);
        const next = list.map((item, idx) => ({ ...item, sira: idx }));
        await updateAyranlarSira(next.map(i => ({ id: i.id, sira: i.sira ?? 0 })));
        setAyrans(next);
        setSelectedId(created.id);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: unknown) {
      alert('Hata: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const removeEntry = async (item: AyranEntry) => {
    if (!window.confirm(`“${item.marka}” kaydını silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteAyran(item.id, item.fotograf_url);
      setAyrans(prev => prev.filter(a => a.id !== item.id));
      setSelectedId(prev => (prev === item.id ? null : prev));
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: unknown) {
      alert('Silme sırasında hata oluştu: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const openAdd = () => { setEditingItem(null); setIsFormOpen(true); };

  const renderFilterPanel = (instanceId: string, layout: 'stack' | 'inline') => (
    <FilterPanel
      instanceId={instanceId}
      layout={layout}
      view={view}
      onChangeView={setView}
      viewCounts={viewCounts}
      categories={categories}
      onToggleCategory={toggleCategory}
      onClearCategories={() => setCategories(new Set())}
      categoryCounts={categoryCounts}
    />
  );

  const listBody = (() => {
    if (loading) return <p className="state-msg">Yükleniyor…</p>;
    if (total === 0) {
      return (
        <div className="state-empty">
          <p className="state-empty-title">Henüz ayran kaydın yok</p>
          <p>İlk ayranını ekleyerek kendi sıralamanı oluşturmaya başla.</p>
          <button type="button" className="btn-primary" onClick={openAdd}>İlk Ayranı Ekle</button>
        </div>
      );
    }
    if (visible.length === 0) {
      return (
        <div className="state-empty">
          <p className="state-empty-title">Eşleşen kayıt yok</p>
          <p>Seçtiğin filtrelere uyan ayran bulunmuyor.</p>
        </div>
      );
    }

    if (!canReorder) {
      return (
        <div className="rows">
          {visible.map((item) => (
            <StaticRow
              key={item.id}
              item={item}
              rank={ranked.findIndex(r => r.id === item.id) + 1}
              isSelected={selectedId === item.id}
              onSelect={handleRowSelect}
            />
          ))}
        </div>
      );
    }

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visible.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="rows">
            {visible.map((item, i) => (
              <DraggableRow
                key={item.id}
                item={item}
                rank={i + 1}
                isSelected={selectedId === item.id}
                onSelect={handleRowSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  })();

  return (
    <div className="app">
      {/* ── Rail: brand + filters (desktop) ──────────── */}
      <aside className="rail">
        <div className="rail-brand">
          <span className="rail-mark">🥛</span>
          <span className="rail-brand-text">
            <strong>Ayran Gurmesi</strong>
            <em>kişisel sıralama defteri</em>
          </span>
        </div>

        <button type="button" className="rail-add" onClick={openAdd}>
          Yeni Ayran Ekle
        </button>

        <div className="rail-filters">{renderFilterPanel('rail', 'stack')}</div>
      </aside>

      {/* ── Center: ranked list ──────────────────────── */}
      <main className="list">
        {/* Masaüstünde marka rayda; mobilde bu ince başlık üstleniyor */}
        <div className="mobile-brand">
          <span className="mobile-brand-mark">🥛</span>
          <span className="mobile-brand-text">
            <strong>Ayran Gurmesi</strong>
            <em>kişisel sıralama defteri</em>
          </span>
        </div>

        {total > 0 && (
          <p className="mobile-summary">
            <strong>{total}</strong> ayran denedin · <strong>{eksiCount}</strong> tanesi ekşi ·{' '}
            <strong>{total - eksiCount}</strong> tanesi değil
          </p>
        )}

        {/* Mobilde filtreler ve başlık kaydırma boyunca sabit kalır */}
        <div className="sticky-top">
          <div className="mobile-filters">{renderFilterPanel('strip', 'inline')}</div>

          <header className="list-head">
            <div className="list-head-top">
              <h1 className="list-title">{VIEW_TITLE[view]}</h1>
              <span className="list-count">{visible.length}</span>
            </div>
            {!canReorder && (
              <p className="list-note">
                Sıralama yalnızca filtresiz “Tüm Kayıtlar” görünümünde değiştirilebilir.
              </p>
            )}
          </header>
        </div>

        {error && (
          <div className="alert">
            {error}
            <button type="button" onClick={load}>Tekrar dene</button>
          </div>
        )}

        {listBody}
      </main>

      {/* ── Right: detail / standings (desktop) ──────── */}
      <section className="pane">
        <DetailPane
          item={selectedItem}
          rank={selectedRank}
          total={total}
          ranked={ranked}
          eksiCount={eksiCount}
          categoryCounts={categoryCounts}
          onEdit={(item) => { setEditingItem(item); setIsFormOpen(true); }}
          onDelete={removeEntry}
          onSelect={(item) => setSelectedId(item.id)}
          onClose={() => setSelectedId(null)}
        />
      </section>

      <button type="button" className="fab" onClick={openAdd} aria-label="Yeni Ayran Ekle">+</button>

      {isSaving && <div className="toast">Sıralama kaydediliyor…</div>}

      <AyranForm
        key={`${editingItem?.id ?? 'new'}-${isFormOpen ? 'open' : 'closed'}`}
        isOpen={isFormOpen}
        editingItem={editingItem}
        initialCategory={categories.size === 1 ? [...categories][0] : 'yaygin_market'}
        existingAyrans={ranked}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        onDelete={editingItem ? () => removeEntry(editingItem) : undefined}
      />
    </div>
  );
}
