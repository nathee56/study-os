'use client';

import { useTodos } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useNotes } from '@/lib/hooks/useNotes';
import { IconCheckSquare, IconCalendar, IconFileText, IconSparkle, IconSend, IconExternalLink, IconClock, IconCloud } from '@/components/ui/Icons';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { AnimatedProgressCircle } from '@/components/ui/AnimatedComponents';

export default function DashboardPage() {
  const { todos } = useTodos();
  const { getTodayClasses } = useSchedule();
  const { notes } = useNotes();
  const [aiQuery, setAiQuery] = useState('');
  const todayClasses = useMemo(() => getTodayClasses(), [getTodayClasses]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      setIsTablet(w > 768 && w <= 1279);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { files: workspaceFiles, loading: wsLoading, error: wsError, fetchRecentFiles } = useWorkspace();
  useEffect(() => { fetchRecentFiles(); }, [fetchRecentFiles]);

  const pendingTodos = todos.filter((t) => !t.done);
  const todayTodos = todos.filter((t) => !t.done).slice(0, isMobile ? 3 : 6);
  const completedThisWeek = todos.filter((t) => t.done).length;
  const totalTodos = todos.length;
  const progressPct = totalTodos > 0 ? Math.round((completedThisWeek / totalTodos) * 100) : 0;
  const displayClasses = isMobile ? todayClasses.slice(0, 2) : todayClasses;

  const aiTools = [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Gemini', url: 'https://gemini.google.com' },
    { name: 'ChatGPT', url: 'https://chatgpt.com' },
    { name: 'Claude', url: 'https://claude.ai' },
    { name: 'NotebookLM', url: 'https://notebooklm.google.com' },
  ];

  const gridCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <div className="animate-in">
      {/* AI Summary Banner — full width, left=content, right=stats */}
      <div className="card" style={{ 
        marginBottom: isMobile ? 16 : 18, 
        padding: isMobile ? 16 : 20,
        display: isMobile ? 'block' : 'flex',
        gap: 0,
      }}>
        {/* Left: AI content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: isMobile ? 14 : 16 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: 10, background: 'var(--orange-light)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)',
              flexShrink: 0,
            }}>
              <IconSparkle size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, marginBottom: 4, fontWeight: 500 }}>สรุปภาพรวมวันนี้</h3>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {pendingTodos.length > 0 ? (
                  <span>
                    คุณมีงานค้าง <strong style={{ color: 'var(--text-primary)' }}>{pendingTodos.length} รายการ</strong>
                    {todayClasses.length > 0 && ` และคาบเรียน ${todayClasses.length} คาบวันนี้`}
                  </span>
                ) : (
                  <span>ยอดเยี่ยม! วันนี้ไม่มีงานค้าง พร้อมลุยวันใหม่</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="ถาม AI เกี่ยวกับงานของคุณ..." value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} style={{ flex: 1, height: 36, fontSize: 13 }} />
            <Link href={aiQuery ? `/ai?q=${encodeURIComponent(aiQuery)}` : '/ai'}>
              <button className="btn-primary" style={{ height: 36, padding: '0 14px' }}><IconSend size={15} /></button>
            </Link>
          </div>
        </div>

        {/* Right: Inline stats — desktop/tablet only */}
        {!isMobile && (
          <div style={{ display: 'flex', borderLeft: '0.5px solid var(--border-strong)', marginLeft: 20, paddingLeft: 20, gap: 0, flexShrink: 0 }}>
            {[
              { icon: IconCheckSquare, value: pendingTodos.length, label: 'งานค้าง' },
              { icon: IconCalendar, value: todayClasses.length, label: 'คาบวันนี้' },
              { 
                isProgress: true, 
                value: `${progressPct}%`, 
                label: 'ความคืบหน้า' 
              },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 16px', borderLeft: i > 0 ? '0.5px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {stat.isProgress ? (
                  <div style={{ marginBottom: 4 }}>
                    <AnimatedProgressCircle progress={progressPct} size={20} strokeWidth={2.5} />
                  </div>
                ) : stat.icon ? (
                  <stat.icon size={16} style={{ color: 'var(--orange)', marginBottom: 4 }} />
                ) : null}
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', whiteSpace: 'nowrap' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile stats grid */}
      {isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { icon: IconCheckSquare, value: pendingTodos.length, label: 'งานค้าง' },
            { icon: IconCalendar, value: todayClasses.length, label: 'คาบวันนี้' },
            { icon: IconFileText, value: notes.length, label: 'โน้ตทั้งหมด' },
            { isProgress: true, value: `${progressPct}%`, label: 'ความคืบหน้า' },
          ].map((stat, i) => (
            <div key={i} className="card mobile-card" style={{ textAlign: 'center', padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {stat.isProgress ? (
                <div style={{ marginBottom: 4 }}>
                  <AnimatedProgressCircle progress={progressPct} size={24} strokeWidth={3} />
                </div>
              ) : stat.icon ? (
                <stat.icon size={18} style={{ color: 'var(--orange)', marginBottom: 4 }} />
              ) : null}
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content Grid — 3-col desktop, 2-col tablet, 1-col mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 18 }}>
        {/* Col 1: Today's Todos */}
        <div className="card mobile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>To-Do วันนี้</h3>
            <Link href="/todo" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูทั้งหมด</Link>
          </div>
          {todayTodos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>ไม่มีงานค้าง</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {todayTodos.map((todo) => (
                <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: todo.priority === 'urgent' ? 'var(--danger)' : 'var(--orange)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.title}</div>
                    {todo.subject && <span className="pill pill-neutral" style={{ marginTop: 3, fontSize: 9 }}>{todo.subject}</span>}
                  </div>
                  {todo.dueDate && (
                    <span style={{ fontSize: 11, color: 'var(--text-hint)', whiteSpace: 'nowrap' }}>
                      {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Today's Schedule */}
        <div className="card mobile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>คาบเรียนวันนี้</h3>
            <Link href="/schedule" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูตาราง</Link>
          </div>
          {displayClasses.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>วันนี้ไม่มีคาบเรียน</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayClasses.map((cls) => (
                <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--cream)', borderRadius: 8 }}>
                  <IconClock size={15} style={{ color: 'var(--text-hint)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{cls.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cls.room} - {cls.teacher}</div>
                  </div>
                  <span className="pill pill-orange" style={{ fontSize: 10 }}>{cls.startTime}-{cls.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 3: Notes + Links + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, gridColumn: isTablet ? 'span 2' : undefined }}>
          {/* Recent Notes */}
          <div className="card mobile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>โน้ตล่าสุด</h3>
              <Link href="/notes" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูทั้งหมด</Link>
            </div>
            {notes.slice(0, 3).map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '7px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{note.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                    {note.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </Link>
            ))}
            {notes.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 12 }}>ยังไม่มีโน้ต</p>}
          </div>

          {/* Google Drive */}
          <div className="card mobile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <IconCloud size={15} style={{ color: '#4285F4' }} />
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Google Drive</h3>
            </div>
            {wsLoading ? (
              <div className="skeleton" style={{ height: 48 }} />
            ) : wsError ? (
              <div style={{ padding: 10, background: 'var(--danger-light)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
                {wsError}
                <button className="btn-ghost" onClick={() => fetchRecentFiles()} style={{ padding: '4px 8px', marginTop: 6, fontSize: 11 }}>ลองอีกครั้ง</button>
              </div>
            ) : workspaceFiles.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 10 }}>ไม่พบไฟล์ล่าสุด</p>
            ) : (
              <div>
                {workspaceFiles.slice(0, 3).map((file) => (
                  <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                      <img src={file.iconLink} alt="" style={{ width: 14, height: 14 }} />
                      <div style={{ fontSize: 13, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links + AI Tools */}
          <div className="card mobile-card">
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>ทางลัดระบบ & AI</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-hint)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>มหาวิทยาลัย</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <a href="http://regis.nsru.ac.th/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: 12 }}>
                  <IconExternalLink size={13} style={{ color: 'var(--orange)' }} />ระบบทะเบียน
                </a>
                <a href="https://elearning.nsru.ac.th/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: 12 }}>
                  <IconExternalLink size={13} style={{ color: 'var(--success)' }} />E-Learning
                </a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-hint)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Assistants</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {aiTools.map((tool) => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="chip" style={{ padding: '5px 10px', fontSize: 12, background: 'var(--surface)' }}>
                    <img src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(tool.url).hostname}`} alt="" style={{ width: 13, height: 13 }} />
                    <span style={{ fontWeight: 500 }}>{tool.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="card mobile-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Progress สัปดาห์นี้</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>งานเสร็จ</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{completedThisWeek}/{totalTodos}</span>
            </div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
