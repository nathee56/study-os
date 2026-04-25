'use client';

import { useMemo } from 'react';
import { useTodos } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useAutoScheduler, DAY_LABELS } from '@/lib/hooks/useAutoScheduler';
import { IconSparkle, IconTarget, IconTrash, IconZap } from '@/components/ui/Icons';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

export default function AutoSchedulePage() {
  const { todos } = useTodos();
  const { schedule } = useSchedule();
  const { timeBlocks, isScheduling, autoSchedule, removeBlock, clearBlocks } = useAutoScheduler();

  const pendingTodos = todos.filter(t => !t.done);

  const scheduleByDay = useMemo(() => {
    const map: Record<string, typeof schedule> = {};
    DAYS.forEach(d => { map[d] = schedule.filter(s => s.day === d); });
    return map;
  }, [schedule]);

  const blocksByDay = useMemo(() => {
    const map: Record<string, typeof timeBlocks> = {};
    DAYS.forEach(d => { map[d] = timeBlocks.filter(b => b.day === d); });
    return map;
  }, [timeBlocks]);

  const getTopPercent = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 8) * 60 + m) / (12 * 60) * 100;
  };

  const getHeightPercent = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    return (duration / (12 * 60)) * 100;
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTarget size={24} style={{ color: 'var(--orange)' }} />
            Auto Schedule
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            AI จะจัดตาราง {pendingTodos.length} งานค้างลงในช่วงว่างอัตโนมัติ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {timeBlocks.length > 0 && (
            <button className="btn-ghost" onClick={clearBlocks} style={{ fontSize: 12 }}>
              <IconTrash size={14} /> ล้างทั้งหมด
            </button>
          )}
          <button className="btn-primary haptic-press" onClick={() => autoSchedule(todos, schedule)}
            disabled={isScheduling || pendingTodos.length === 0}
            style={{ borderRadius: 12, fontSize: 13 }}>
            <IconZap size={16} />
            {isScheduling ? 'กำลังจัด...' : 'Auto-fill ตาราง'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#C4D5E8' }} /> คาบเรียน
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#F0EBF8', border: '2px solid #886FBF' }} /> AI จัดให้
        </span>
      </div>

      {/* Weekly Calendar */}
      <div className="card" style={{ overflow: 'auto', padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', minWidth: 700 }}>
          {/* Header */}
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
          {DAYS.map(day => (
            <div key={day} style={{
              padding: 12, textAlign: 'center', borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)', fontSize: 13, fontWeight: 600,
            }}>
              {DAY_LABELS[day]}
            </div>
          ))}

          {/* Time grid */}
          <div style={{ position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} style={{
                height: 60, padding: '4px 8px', fontSize: 10, color: 'var(--text-hint)',
                borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)',
              }}>
                {h}:00
              </div>
            ))}
          </div>

          {DAYS.map(day => (
            <div key={day} style={{ position: 'relative', minHeight: HOURS.length * 60, borderRight: '1px solid var(--border)' }}>
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} style={{ height: 60, borderBottom: '1px solid var(--border)' }} />
              ))}

              {/* Classes */}
              {scheduleByDay[day]?.map(cls => (
                <div key={cls.id} style={{
                  position: 'absolute', left: 4, right: 4,
                  top: `${getTopPercent(cls.startTime)}%`,
                  height: `${getHeightPercent(cls.startTime, cls.endTime)}%`,
                  background: cls.color || '#C4D5E8',
                  borderRadius: 6, padding: '4px 8px', fontSize: 11, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  zIndex: 2,
                }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{cls.startTime}-{cls.endTime}</div>
                </div>
              ))}

              {/* AI Time Blocks */}
              {blocksByDay[day]?.map(block => (
                <div key={block.id} className="time-block ai-suggested" style={{
                  position: 'absolute', left: 4, right: 4,
                  top: `${getTopPercent(block.startTime)}%`,
                  height: `${getHeightPercent(block.startTime, block.endTime)}%`,
                  zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <IconSparkle size={10} style={{ marginRight: 2 }} />{block.todoTitle}
                      </div>
                      <div style={{ fontSize: 9, opacity: 0.7 }}>{block.startTime}-{block.endTime} ({block.duration} นาที)</div>
                    </div>
                    <button onClick={() => removeBlock(block.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--danger)', fontSize: 10 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {timeBlocks.length > 0 && (
        <div className="card" style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSparkle size={16} style={{ color: '#886FBF' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#886FBF' }}>AI จัดตารางให้คุณ {timeBlocks.length} รายการ</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {timeBlocks.map(b => (
              <span key={b.id} className="pill" style={{ background: '#E8E0F5', color: '#886FBF', fontSize: 11 }}>
                {DAY_LABELS[b.day]} {b.startTime} — {b.todoTitle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
