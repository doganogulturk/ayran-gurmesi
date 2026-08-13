'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AyranEntry } from '../types/ayran';

export const brandColor = (marka: string) => {
  let hash = 0;
  for (let i = 0; i < marka.length; i++) {
    hash = marka.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 42%, 44%)`;
};

export const brandInitials = (marka: string | null | undefined) => {
  const words = (marka || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A';
  return words.slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'A';
};

interface RowProps {
  item: AyranEntry;
  rank: number;
  isSelected: boolean;
  onSelect: (item: AyranEntry) => void;
  draggable?: boolean;
}

function RowShell({
  item, rank, isSelected, onSelect, draggable,
  handleProps, nodeRef, style, dragging,
}: RowProps & {
  handleProps?: Record<string, unknown>;
  nodeRef?: (n: HTMLElement | null) => void;
  style?: React.CSSProperties;
  dragging?: boolean;
}) {
  const isPodium = rank <= 3;

  return (
    <div
      ref={nodeRef}
      style={style}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      className={`row${isSelected ? ' is-selected' : ''}${dragging ? ' is-dragging' : ''}`}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {draggable && (
        <span
          className="row-grip"
          aria-label="Sürükleyerek sırala"
          onClick={(e) => e.stopPropagation()}
          {...handleProps}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
            <circle cx="2" cy="2" r="1.4" /><circle cx="8" cy="2" r="1.4" />
            <circle cx="2" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" />
            <circle cx="2" cy="14" r="1.4" /><circle cx="8" cy="14" r="1.4" />
          </svg>
        </span>
      )}

      <span className={`row-rank${isPodium ? ' is-podium' : ''}`} data-rank={rank}>
        {rank}
      </span>

      {item.fotograf_url
        ? <img src={item.fotograf_url} className="row-thumb" alt="" />
        : (
          <span className="row-thumb row-thumb-fallback" style={{ background: brandColor(item.marka || '') }}>
            {brandInitials(item.marka)}
          </span>
        )
      }

      <span className="row-text">
        <span className="row-name">
          {item.marka}
          {item.urun_adi && <span className="row-variant"> {item.urun_adi}</span>}
        </span>
        {(item.market_adi || item.yore) && (
          <span className="row-sub">
            {item.kategori === 'market_markasi' && item.market_adi}
            {item.kategori === 'yoresel' && item.yore}
          </span>
        )}
      </span>

      {item.eksi_mi && <span className="row-tag">Ekşi</span>}
    </div>
  );
}

export function StaticRow(props: RowProps) {
  return <RowShell {...props} draggable={false} />;
}

export function DraggableRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.item.id });

  return (
    <RowShell
      {...props}
      draggable
      nodeRef={setNodeRef}
      dragging={isDragging}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
      }}
      handleProps={{ ...attributes, ...listeners }}
    />
  );
}
