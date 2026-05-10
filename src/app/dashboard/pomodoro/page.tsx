'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useTodos } from '@/lib/hooks/useTodos';
import { IconPlayerPlay, IconPlayerPause, IconRefresh, IconSparkle, IconVolume, IconVolumeOff, IconX, IconCheckSquare } from '@/components/ui/Icons';

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'ปิดเสียง', emoji: '🔇', url: '' },
  { id: 'rain', name: 'เสียงฝน', emoji: '🌧️', url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112ce99.mp3' },
  { id: 'fire', name: 'เสียงกองไฟ', emoji: '🔥', url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_01a0ad4baa.mp3' },
  { id: 'birds', name: 'เสียงนก', emoji: '🐦', url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c610906fd6.mp3' },
];

const MODE_CONFIG = {
  focus: { label: '🔥 โฟกัส', time: 25, color: 'var(--orange)', bg: 'linear-gradient(135deg, #ff6b1a 0%, #e8651a 50%, #d45a15 100%)' },
  shortBreak: { label: '☕ พักสั้น', time: 5, color: 'var(--success)', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  longBreak: { label: '🌿 พักยาว', time: 15, color: 'var(--violet)', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
};

type Mode = keyof typeof MODE_CONFIG;

export default function PomodoroPage() {
  const { getTodayClasses } = useSchedule();
  const { todos } = useTodos();
  const todayClasses = useMemo(() => getTodayClasses(), [getTodayClasses]);
  const pendingTodos = todos.filter(t => !t.done);

  const [mode, setMode] = useState<Mode>('focus');
  const [totalSeconds, setTotalSeconds] = useState(MODE_CONFIG.focus.time * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(MODE_CONFIG.focus.time * 60);
  const [isActive, setIsActive] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null);
  const [ambientId, setAmbientId] = useState('none');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load today's focus stats
  useEffect(() => {
    const todayKey = `jamdai_focus_${new Date().toISOString().slice(0, 10)}`;
    const saved = localStorage.getItem(todayKey);
    if (saved) setTotalFocusToday(parseInt(saved, 10));
  }, []);

  // Ambient sound management
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current = null;
    }
    const sound = AMBIENT_SOUNDS.find(s => s.id === ambientId);
    if (sound && sound.url && isActive) {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      ambientRef.current = audio;
    }
    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current = null;
      }
    };
  }, [ambientId, isActive]);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const time = MODE_CONFIG[newMode].time * 60;
    setTotalSeconds(time);
    setRemainingSeconds(time);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const time = MODE_CONFIG[mode].time * 60;
    setTotalSeconds(time);
    setRemainingSeconds(time);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);

            // Play completion sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch {}

            // Update stats
            if (mode === 'focus') {
              const focusTime = MODE_CONFIG.focus.time;
              setSessions(s => s + 1);
              setTotalFocusToday(prev => {
                const newVal = prev + focusTime;
                const todayKey = `jamdai_focus_${new Date().toISOString().slice(0, 10)}`;
                localStorage.setItem(todayKey, newVal.toString());
                return newVal;
              });

              // Auto switch to break
              const newSessions = sessions + 1;
              if (newSessions % 4 === 0) {
                setTimeout(() => switchMode('longBreak'), 500);
              } else {
                setTimeout(() => switchMode('shortBreak'), 500);
              }
            } else {
              // Break finished, switch to focus
              setTimeout(() => switchMode('focus'), 500);
            }

            setIsImmersive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, mode, sessions, switchMode]);

  const toggleTimer = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    if (newActive) setIsImmersive(true);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);
  const focusHours = Math.floor(totalFocusToday / 60);
  const focusMins = totalFocusToday % 60;

  const nextClass = todayClasses.find(c => {
    const [h, m] = c.startTime.split('.').map(Number);
    const now = new Date();
    const classTime = new Date();
    classTime.setHours(h, m, 0);
    return classTime > now;
  });

  const selectedTodoItem = pendingTodos.find(t => t.id === selectedTodo);

  // === IMMERSIVE MODE ===
  if (isImmersive) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: MODE_CONFIG[mode].bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: 'white', transition: 'background 0.8s ease',
      }}>
        {/* Exit button */}
        <button
          onClick={() => setIsImmersive(false)}
          style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, backdropFilter: 'blur(8px)' }}
        >
          <IconX size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> ย่อ
        </button>

        {/* Session counter */}
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 6 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < (sessions % 4) ? '#fff' : 'rgba(255,255,255,0.25)',
              transition: 'background 0.3s',
            }} />
          ))}
          <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>รอบที่ {sessions + 1}</span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 600, width: '100%', padding: 20 }}>
          {/* Status text */}
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 24, opacity: 0.9 }}>
            {MODE_CONFIG[mode].label}
          </div>

          {/* Circular Timer */}
          <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto' }}>
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
              <circle cx="130" cy="130" r="120" fill="none" stroke="#fff" strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 56, fontWeight: 700, fontFamily: 'var(--font-sans)', letterSpacing: -2, lineHeight: 1 }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              {selectedTodoItem && (
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📌 {selectedTodoItem.title}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 20, marginTop: 40, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={resetTimer} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 60, height: 60, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <IconRefresh size={24} />
            </button>
            <button onClick={() => setIsActive(!isActive)} style={{ background: '#fff', border: 'none', color: MODE_CONFIG[mode].color, width: 90, height: 90, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isActive ? <IconPlayerPause size={40} /> : <div style={{ marginLeft: 4 }}><IconPlayerPlay size={40} /></div>}
            </button>
            <button onClick={() => { const sounds = AMBIENT_SOUNDS; const idx = sounds.findIndex(s => s.id === ambientId); setAmbientId(sounds[(idx + 1) % sounds.length].id); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 60, height: 60, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', fontSize: 20 }}>
              {AMBIENT_SOUNDS.find(s => s.id === ambientId)?.emoji || '🔇'}
            </button>
          </div>

          {/* Ambient label */}
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>
            {AMBIENT_SOUNDS.find(s => s.id === ambientId)?.name}
          </div>

          {/* Next class reminder */}
          {nextClass && (
            <div style={{ marginTop: 40, padding: '14px 24px', background: 'rgba(255,255,255,0.12)', borderRadius: 16, backdropFilter: 'blur(10px)', display: 'inline-block' }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>วิชาถัดไป: </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{nextClass.name}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}> ({nextClass.startTime})</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === NORMAL MODE ===
  return (
    <div className="animate-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

        {/* Timer Card */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'var(--surface-raised)', borderRadius: 14, padding: 4 }}>
            {(Object.keys(MODE_CONFIG) as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: mode === m ? MODE_CONFIG[m].color : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.3s ease',
              }}>
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Circular Timer */}
          <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
            <svg width="220" height="220" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="130" cy="130" r="120" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="130" cy="130" r="120" fill="none" stroke={MODE_CONFIG[mode].color} strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', letterSpacing: -2, lineHeight: 1 }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
            <button className="btn-icon" onClick={resetTimer} style={{ width: 52, height: 52, background: 'var(--surface-raised)' }}>
              <IconRefresh size={22} />
            </button>
            <button className="btn-primary" onClick={toggleTimer} style={{
              width: 68, height: 68, borderRadius: 20,
              background: isActive ? 'var(--text-primary)' : MODE_CONFIG[mode].color,
              boxShadow: `0 8px 24px ${MODE_CONFIG[mode].color}33`,
            }}>
              {isActive ? <IconPlayerPause size={30} /> : <IconPlayerPlay size={30} />}
            </button>
            <button className="btn-icon" onClick={() => { const sounds = AMBIENT_SOUNDS; const idx = sounds.findIndex(s => s.id === ambientId); setAmbientId(sounds[(idx + 1) % sounds.length].id); }}
              style={{ width: 52, height: 52, background: 'var(--surface-raised)', fontSize: 18 }}>
              {AMBIENT_SOUNDS.find(s => s.id === ambientId)?.emoji || '🔇'}
            </button>
          </div>

          {/* Session dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < (sessions % 4) ? MODE_CONFIG.focus.color : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-hint)', marginLeft: 4 }}>
              {sessions} รอบสำเร็จ
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Focus Stats */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconSparkle size={16} style={{ color: 'var(--orange)' }} />
              สถิติการโฟกัสวันนี้
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--orange-light)', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{sessions}</div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>รอบ</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--success-light)', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
                  {focusHours > 0 ? `${focusHours}h` : `${focusMins}m`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>เวลารวม</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--violet-soft)', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--violet)' }}>
                  {Math.round((sessions / 8) * 100)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>เป้าหมาย</div>
              </div>
            </div>
          </div>

          {/* Select Todo */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCheckSquare size={16} style={{ color: 'var(--accent)' }} />
              เลือกงานที่กำลังทำ
            </h3>
            {pendingTodos.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 12 }}>ไม่มีงานค้าง 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                {pendingTodos.slice(0, 6).map(todo => (
                  <button key={todo.id} onClick={() => setSelectedTodo(selectedTodo === todo.id ? null : todo.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 10, border: selectedTodo === todo.id ? `2px solid var(--orange)` : '1px solid var(--border)',
                    background: selectedTodo === todo.id ? 'var(--orange-light)' : 'var(--surface)',
                    cursor: 'pointer', textAlign: 'left', fontSize: 13,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: selectedTodo === todo.id ? 'var(--orange)' : 'var(--border)',
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{todo.title}</span>
                    {todo.subject && <span style={{ fontSize: 10, color: 'var(--text-hint)', marginLeft: 'auto', flexShrink: 0 }}>{todo.subject}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ambient Sounds */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>🎵 เสียงบรรยากาศ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {AMBIENT_SOUNDS.map(s => (
                <button key={s.id} onClick={() => setAmbientId(s.id)} style={{
                  padding: '10px 12px', borderRadius: 10, border: ambientId === s.id ? `2px solid var(--orange)` : '1px solid var(--border)',
                  background: ambientId === s.id ? 'var(--orange-light)' : 'var(--surface)',
                  cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Next class */}
          {nextClass && (
            <div className="card" style={{ padding: 16, background: 'var(--orange-light)' }}>
              <div style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 4, fontWeight: 600 }}>คาบเรียนถัดไป</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{nextClass.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                เริ่มเวลา {nextClass.startTime} ({nextClass.room})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
