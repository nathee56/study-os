'use client';

import { CHANGELOG, CURRENT_VERSION } from '@/lib/changelog';

export default function WhatsNewPage() {
  return (
    <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
        มีอะไรใหม่
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 24 }}>
        เวอร์ชันปัจจุบัน: JamDai {CURRENT_VERSION}
      </p>

      {CHANGELOG.map((entry, idx) => (
        <div key={entry.version} style={{
          marginBottom: 24,
          background: 'var(--surface-card)',
          borderRadius: 16,
          overflow: 'hidden',
          border: idx === 0 ? '2px solid var(--orange)' : '1px solid var(--border)',
        }}>
          {/* Version Header */}
          <div style={{
            padding: '16px 20px',
            background: idx === 0
              ? 'linear-gradient(135deg, var(--orange), #ff6b35)'
              : 'var(--surface-raised)',
            color: idx === 0 ? '#fff' : 'var(--text-primary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {idx === 0 && '🆕 '}v{entry.version}
              </h2>
              <span style={{
                fontSize: 12, opacity: 0.8,
                background: idx === 0 ? 'rgba(255,255,255,0.2)' : 'var(--surface-card)',
                padding: '4px 10px', borderRadius: 999,
              }}>
                {new Date(entry.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p style={{ fontSize: 13, margin: '6px 0 0', opacity: 0.9 }}>{entry.title}</p>
          </div>

          {/* Highlights */}
          <div style={{ padding: '12px 16px' }}>
            {entry.highlights.map((h, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: i < entry.highlights.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'var(--surface-raised)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>{h.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {h.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {h.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
