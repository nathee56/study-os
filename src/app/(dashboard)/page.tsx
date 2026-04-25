'use client';

import { useTodos } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useNotes } from '@/lib/hooks/useNotes';
import { IconCheckSquare, IconCalendar, IconFileText, IconSparkle, IconSend, IconExternalLink, IconClock, IconCloud } from '@/components/ui/Icons';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '@/lib/hooks/useWorkspace';

export default function DashboardPage() {
  const { todos } = useTodos();
  const { getTodayClasses } = useSchedule();
  const { notes } = useNotes();
  const [aiQuery, setAiQuery] = useState('');
  const todayClasses = useMemo(() => getTodayClasses(), [getTodayClasses]);

  const { files: workspaceFiles, loading: wsLoading, error: wsError, fetchRecentFiles } = useWorkspace();

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  const pendingTodos = todos.filter((t) => !t.done);
  const todayTodos = todos.filter((t) => !t.done).slice(0, 6);

  const aiTools = [
    { name: 'Google', url: 'https://google.com', color: '#4285F4' },
    { name: 'Gemini', url: 'https://gemini.google.com', color: '#886FBF' },
    { name: 'ChatGPT', url: 'https://chatgpt.com', color: '#10A37F' },
    { name: 'Claude', url: 'https://claude.ai', color: '#D97757' },
    { name: 'NotebookLM', url: 'https://notebooklm.google.com', color: '#1A73E8' },
  ];

  const completedThisWeek = todos.filter((t) => t.done).length;
  const totalTodos = todos.length;
  const progressPct = totalTodos > 0 ? Math.round((completedThisWeek / totalTodos) * 100) : 0;

  return (
    <div className="animate-in">
      {/* AI Summary Banner */}
      <div className="card" style={{ 
        marginBottom: 24, 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(251, 246, 240, 0.9) 100%)', 
        border: '1px solid var(--border)', 
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 12, background: 'var(--orange-light)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)'
          }}>
            <IconSparkle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, marginBottom: 6, fontWeight: 600 }}>สรุปภาพรวมวันนี้ของคุณ ✨</h3>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {pendingTodos.length > 0 ? (
                <div>
                  คุณมีงานค้างทั้งหมด <strong style={{ color: 'var(--text-primary)' }}>{pendingTodos.length} รายการ</strong> โดยมีงานสำคัญคือ:
                  <ul style={{ margin: '8px 0', paddingLeft: 20, color: 'var(--orange)' }}>
                    {pendingTodos.slice(0, 3).map(t => (
                      <li key={t.id} style={{ marginBottom: 2 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{t.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>ยอดเยี่ยม! วันนี้คุณไม่มีงานค้างเลย พร้อมลุยวันใหม่ครับ</p>
              )}
              <p style={{ marginTop: 8 }}>
                {todayClasses.length > 0 
                  ? `ส่วนตารางเรียน วันนี้มี ${todayClasses.length} คาบ คาบถัดไปคือ "${todayClasses[0].name}" เริ่มตอน ${todayClasses[0].startTime}` 
                  : 'วันนี้ไม่มีตารางเรียน พักผ่อนให้เต็มที่นะครับ'}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="ถาม AI เกี่ยวกับงานหรือตารางเรียนของคุณ..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Link href={aiQuery ? `/ai?q=${encodeURIComponent(aiQuery)}` : '/ai'}>
            <button className="btn-primary" style={{ padding: '10px 16px' }}>
              <IconSend size={16} />
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <IconCheckSquare size={20} style={{ color: 'var(--orange)', marginBottom: 6 }} />
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Georgia, serif', color: 'var(--text-primary)' }}>
            {pendingTodos.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>งานค้าง</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <IconCalendar size={20} style={{ color: 'var(--orange)', marginBottom: 6 }} />
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Georgia, serif', color: 'var(--text-primary)' }}>
            {todayClasses.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>คาบวันนี้</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <IconFileText size={20} style={{ color: 'var(--orange)', marginBottom: 6 }} />
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Georgia, serif', color: 'var(--text-primary)' }}>
            {notes.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>โน้ตทั้งหมด</div>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Col 1: Today's Todos */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>To-Do วันนี้</h3>
            <Link href="/todo" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูทั้งหมด</Link>
          </div>
          {todayTodos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>ไม่มีงานค้าง</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTodos.map((todo) => (
                <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: todo.priority === 'urgent' ? 'var(--danger)' : 'var(--orange)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.title}</div>
                    {todo.subject && <span className="pill pill-neutral" style={{ marginTop: 4 }}>{todo.subject}</span>}
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
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>คาบเรียนวันนี้</h3>
            <Link href="/schedule" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูตาราง</Link>
          </div>
          {todayClasses.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>วันนี้ไม่มีคาบเรียน</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayClasses.map((cls) => (
                <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: cls.color + '30', borderRadius: 8 }}>
                  <IconClock size={16} style={{ color: 'var(--text-hint)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{cls.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cls.room} - {cls.teacher}</div>
                  </div>
                  <span className="pill pill-orange">{cls.startTime}-{cls.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 3: Notes + AI Tools + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent Notes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15 }}>โน้ตล่าสุด</h3>
              <Link href="/notes" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>ดูทั้งหมด</Link>
            </div>
            {notes.slice(0, 3).map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{note.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                    {note.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </Link>
            ))}
            {notes.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 12 }}>ยังไม่มีโน้ต</p>
            )}
          </div>

          {/* Google Workspace */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconCloud size={16} style={{ color: '#4285F4' }} />
                <h3 style={{ fontSize: 15 }}>Google Drive ล่าสุด</h3>
              </div>
            </div>
            {wsLoading ? (
              <div className="skeleton" style={{ height: 60 }} />
            ) : wsError ? (
              <div style={{ padding: 12, background: 'var(--danger-light)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
                {wsError}
                <button className="btn-ghost" onClick={() => fetchRecentFiles()} style={{ padding: '4px 8px', marginTop: 8, fontSize: 11, borderColor: 'var(--danger)', color: 'var(--danger)' }}>ลองอีกครั้ง</button>
              </div>
            ) : workspaceFiles.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 12 }}>ไม่พบไฟล์ล่าสุด</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workspaceFiles.slice(0, 3).map((file) => (
                  <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                      <img src={file.iconLink} alt="" style={{ width: 16, height: 16 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* AI Tools & University Links */}
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>ทางลัดระบบ & AI</h3>
            
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 8 }}>มหาวิทยาลัยราชภัฏนครสวรรค์</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <a href="http://regis.nsru.ac.th/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'var(--cream2)' }}>
                  <IconExternalLink size={14} style={{ color: 'var(--orange)' }} />
                  ระบบทะเบียน
                </a>
                <a href="https://elearning.nsru.ac.th/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'var(--cream2)' }}>
                  <IconExternalLink size={14} style={{ color: 'var(--success)' }} />
                  E-Learning
                </a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 8 }}>AI Assistants</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {aiTools.map((tool) => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="chip" style={{ background: 'white', border: `1px solid var(--border)`, padding: '6px 12px' }}>
                <img 
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(tool.url).hostname}`} 
                  alt="" 
                  style={{ width: 14, height: 14, objectFit: 'contain' }}
                />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tool.name}</span>
              </a>
            ))}
          </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Progress สัปดาห์นี้</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>งานเสร็จ</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedThisWeek}/{totalTodos}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
