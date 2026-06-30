'use client';

import React from 'react';
import { AyranEntry, kategoriler, kategoriEtiketleri, kategoriRenkleri } from '../types/ayran';

interface DashboardProps {
  ayrans: AyranEntry[];
}

export default function Dashboard({ ayrans }: DashboardProps) {
  const total = ayrans.length;
  const eksiSayisi = ayrans.filter(a => a.eksi_mi).length;

  // En çok kayıtlı kategori
  let favoriKategori = '-';
  if (total > 0) {
    const counts = ayrans.reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let max = 0;
    Object.entries(counts).forEach(([kat, count]) => {
      if (count > max) {
        max = count;
        favoriKategori = kategoriEtiketleri[kat as keyof typeof kategoriEtiketleri] || kat;
      }
    });
  }

  // Gurme seviyesi
  let gourmetTitle = 'Yoğurt Çaylağı';
  let nextLevelCount = 1;
  if (total >= 1 && total <= 2) { gourmetTitle = 'Ayran Çırağı'; nextLevelCount = 3; }
  else if (total >= 3 && total <= 5) { gourmetTitle = 'Ayran Kalfası'; nextLevelCount = 6; }
  else if (total >= 6 && total <= 9) { gourmetTitle = 'Ayran Ustası'; nextLevelCount = 10; }
  else if (total >= 10 && total <= 14) { gourmetTitle = 'Ayran Gurmesi'; nextLevelCount = 15; }
  else if (total >= 15) { gourmetTitle = 'Ayran İmparatoru'; nextLevelCount = 999; }

  const progressText = nextLevelCount === 999
    ? 'Maksimum Seviye!'
    : `Sonraki seviye için son ${nextLevelCount - total} bardak!`;

  // Donut chart
  const kategorikSayilar = kategoriler.reduce((acc, kat) => {
    acc[kat] = 0;
    return acc;
  }, {} as Record<string, number>);

  ayrans.forEach(item => {
    if (kategorikSayilar[item.kategori] !== undefined) {
      kategorikSayilar[item.kategori]++;
    }
  });

  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const strokeWidth = 14;

  const slices = kategoriler
    .filter(kat => kategorikSayilar[kat] > 0)
    .map((kat, index, all) => {
      const count = kategorikSayilar[kat];
      const pct = count / total;
      const dashArray = `${pct * circ} ${circ}`;
      const offsetPercent = all
        .slice(0, index)
        .reduce((acc, prevKat) => acc + (kategorikSayilar[prevKat] / total), 0);
      const dashOffset = -offsetPercent * circ;
      const color = kategoriRenkleri[kat];
      return { kat, count, pct, dashArray, dashOffset, color };
    });

  return (
    <>
      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">🥛</div>
          <div className="stat-info">
            <span className="stat-label">Toplam Tadan</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>
        <div className="card stat-card accent-style">
          <div className="stat-icon">🍋</div>
          <div className="stat-info">
            <span className="stat-label">Ekşi Ayran</span>
            <span className="stat-value">{eksiSayisi}</span>
          </div>
        </div>
        <div className="card stat-card success-style">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <span className="stat-label">Favori Kategori</span>
            <span className="stat-value" style={{ fontSize: favoriKategori.length > 12 ? '1.1rem' : '1.5rem' }}>
              {favoriKategori}
            </span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-label">Gurme Seviyesi</span>
            <span className="stat-value">{gourmetTitle}</span>
            <span className="stat-subtext">{progressText}</span>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Kategori Dağılımı</h3>
        <div className="chart-box">
          {total === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Grafik çizilebilmesi için veri ekleyin.
            </div>
          ) : (
            <>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth={strokeWidth} opacity="0.2" />
                {slices.map((slice, i) => (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                ))}
                <text x="80" y="85" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="1.25rem" fill="var(--text-main)">
                  {total} Adet
                </text>
              </svg>

              <div className="donut-legend">
                {slices.map((slice, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-label">
                      <span className="legend-color" style={{ backgroundColor: slice.color }}></span>
                      <span>{kategoriEtiketleri[slice.kat]}</span>
                    </span>
                    <span className="legend-count">{slice.count} ({(slice.pct * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
