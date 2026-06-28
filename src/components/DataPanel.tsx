'use client';

import React from 'react';

interface DataPanelProps {
  onRefresh: () => void;
}

export default function DataPanel({ onRefresh }: DataPanelProps) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px' }}>Veri Yönetimi</h3>
      <div className="data-panel-content">
        <button onClick={onRefresh} className="btn btn-secondary" style={{ width: '100%' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
          </svg>
          Verileri Yenile
        </button>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
          Veriler Supabase&apos;den yükleniyor
        </p>
      </div>
    </div>
  );
}
