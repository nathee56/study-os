'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { IconClock, IconPlayerPlay, IconPlayerPause, IconRefresh, IconBell, IconSparkle, IconVolume, IconVolumeOff, IconX } from '@/components/ui/Icons';

export default function PomodoroPage() {
  const { getTodayClasses } = useSchedule();
  const todayClasses = getTodayClasses();
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          setIsImmersive(false);
          if (timerRef.current) clearInterval(timerRef.current);
          
          if (audioEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          }
          
          alert(mode === 'focus' ? 'ได้เวลาพักแล้ว! เก่งมากครับ' : 'ได้เวลากลับไปตั้งใจเรียนแล้ว!');
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, minutes, seconds, mode, audioEnabled]);

  const toggleTimer = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    if (newActive) setIsImmersive(true);
  };

  const nextClass = todayClasses.find(c => {
    const [h, m] = c.startTime.split('.').map(Number);
    const now = new Date();
    const classTime = new Date();
    classTime.setHours(h, m, 0);
    return classTime > now;
  });

  if (isImmersive) {
    return (
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 999, 
        background: mode === 'focus' ? 'var(--orange)' : 'var(--success)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: 'white', transition: 'background 0.5s ease'
      }}>
        <button 
          onClick={() => setIsImmersive(false)}
          style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}
        >
          <IconX size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> ออกจากการโฟกัส
        </button>

        <div style={{ textAlign: 'center', maxWidth: 600, width: '100%', padding: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 16, opacity: 0.9 }}>
            {mode === 'focus' ? 'กำลังตั้งใจเรียน... 📖' : 'พักสายตาสักครู่... ☕'}
          </div>
          
          <div style={{ fontSize: 'min(25vw, 200px)', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1, letterSpacing: -5 }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 60, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={resetTimer} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 80, height: 80, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconRefresh size={32} />
            </button>
            <button 
              onClick={() => setIsActive(!isActive)}
              style={{ background: 'var(--surface)', border: 'none', color: mode === 'focus' ? 'var(--orange)' : 'var(--success)', width: 120, height: 120, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isActive ? <IconPlayerPause size={56} /> : <div style={{ marginLeft: 8 }}><IconPlayerPlay size={56} /></div>}
            </button>
            <button onClick={() => setAudioEnabled(!audioEnabled)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 80, height: 80, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {audioEnabled ? <IconVolume size={32} /> : <IconVolumeOff size={32} />}
            </button>
          </div>

          {nextClass && (
            <div style={{ marginTop: 80, padding: '20px 40px', background: 'rgba(255,255,255,0.15)', borderRadius: 24, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>วิชาถัดไป</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{nextClass.name}</div>
              <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>เวลา {nextClass.startTime} น. | {nextClass.room}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Timer Card */}
        <div className="card" style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: 'var(--surface)'
        }}>
          <div className="pill" style={{ 
            background: mode === 'focus' ? 'var(--orange-light)' : 'var(--success-light)',
            color: mode === 'focus' ? 'var(--orange)' : 'var(--success)',
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 600
          }}>
            {mode === 'focus' ? '🔥 Focus Mode' : '☕ Break Mode'}
          </div>

          <div style={{ 
            fontSize: 84, 
            fontWeight: 700, 
            fontFamily: 'monospace', 
            color: 'var(--text-primary)',
            letterSpacing: -2,
            lineHeight: 1
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <button className="btn-icon" onClick={resetTimer} style={{ width: 56, height: 56, background: 'var(--cream3)' }}>
              <IconRefresh size={24} />
            </button>
            <button 
              className="btn-primary" 
              onClick={toggleTimer}
              style={{ 
                width: 72, height: 72, borderRadius: 24, 
                background: isActive ? 'var(--text-primary)' : 'var(--orange)',
                boxShadow: '0 10px 20px rgba(232, 101, 26, 0.2)'
              }}
            >
              {isActive ? <IconPlayerPause size={32} /> : <IconPlayerPlay size={32} />}
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setAudioEnabled(!audioEnabled)} 
              style={{ width: 56, height: 56, background: 'var(--cream3)' }}
            >
              {audioEnabled ? <IconVolume size={24} /> : <IconVolumeOff size={24} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button 
              className={`btn-ghost ${mode === 'focus' ? 'active' : ''}`}
              onClick={() => { setMode('focus'); resetTimer(); }}
              style={{ padding: '8px 20px', borderRadius: 20 }}
            >
              Pomodoro
            </button>
            <button 
              className={`btn-ghost ${mode === 'break' ? 'active' : ''}`}
              onClick={() => { setMode('break'); resetTimer(); }}
              style={{ padding: '8px 20px', borderRadius: 20 }}
            >
              Short Break
            </button>
          </div>
        </div>

        {/* Info & Next Class */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconSparkle size={18} style={{ color: 'var(--orange)' }} />
              สถานะการเรียนวันนี้
            </h3>
            
            {nextClass ? (
              <div style={{ padding: 16, background: 'var(--orange-light)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 4, fontWeight: 600 }}>คาบเรียนถัดไป</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{nextClass.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  เริ่มเวลา {nextClass.startTime} ({nextClass.room})
                </div>
              </div>
            ) : (
              <div style={{ padding: 16, background: 'var(--success-light)', borderRadius: 12 }}>
                <div style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>วันนี้เรียนครบทุกคาบแล้ว!</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>คุณสามารถโฟกัสกับการทำการบ้านต่อได้</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Tips การโฟกัส</h3>
            <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>วางโทรศัพท์มือถือไว้ให้ไกลตัว</li>
              <li>จิบน้ำบ่อยๆ เพื่อให้สมองตื่นตัว</li>
              <li>ใช้เวลาพัก 5 นาทีเพื่อยืดเส้นยืดสาย</li>
              <li>จดสิ่งที่กังวลลงกระดาษเพื่อลดความพะวง</li>
            </ul>
          </div>
        </div>

      </div>

      <style jsx>{`
        .btn-ghost.active {
          background: var(--text-primary);
          color: white;
          border-color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
