'use client';

import { AIAlert } from '@/lib/hooks/useAIAlert';
import { IconX } from './Icons';

const urgencyStyles: Record<string, { bg: string; border: string; icon: string }> = {
  high: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '🔴' },
  medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '🟡' },
  low: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: '🔵' },
};

interface AIAlertCardProps {
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

export default function AIAlertCard({ alerts, loading, onDismiss }: AIAlertCardProps) {
  if (loading) {
    return (
      <div style={{
        padding: '12px 16px', borderRadius: 16,
        background: 'var(--surface-card)', border: '1px solid var(--border)',
        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
        animation: 'pulse 1.5s infinite',
      }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>AI กำลังวิเคราะห์สิ่งที่ควรแจ้งเตือน...</span>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      {alerts.map((alert, i) => {
        const style = urgencyStyles[alert.urgency] || urgencyStyles.medium;
        return (
          <div key={i} style={{
            padding: '12px 16px', borderRadius: 16,
            background: style.bg, border: `1px solid ${style.border}`,
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeInUp 0.3s ease-out',
            animationDelay: `${i * 0.1}s`,
            animationFillMode: 'both',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{style.icon}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {alert.message}
            </span>
            <button
              onClick={() => onDismiss(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-hint)', padding: 4, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
