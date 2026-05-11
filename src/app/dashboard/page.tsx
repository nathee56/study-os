'use client';

import { useTodos } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useNotes } from '@/lib/hooks/useNotes';
import { useAuth } from '@/lib/hooks/useAuth';
import { IconCheckSquare, IconCalendar, IconFileText, IconSparkle, IconSend, IconExternalLink, IconClock, IconCloud } from '@/components/ui/Icons';
import PWACapsule from '@/components/ui/PWACapsule';
import AIAlertCard from '@/components/ui/AIAlertCard';
import WhatsNewPopup from '@/components/ui/WhatsNewPopup';
import AIBanner from '@/components/ui/AIBanner';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { useAIAlert } from '@/lib/hooks/useAIAlert';
import { useAIMemory } from '@/lib/hooks/useAIMemory';
import { AnimatedProgressCircle } from '@/components/ui/AnimatedComponents';
import EmptyState from '@/components/ui/EmptyState';
import TaskProgressChart from '@/components/ui/TaskProgressChart';
import DraggableWidgetCard from '@/components/ui/DraggableWidgetCard';
import { Reorder } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { todos } = useTodos();
  const { getTodayClasses } = useSchedule();
  const { notes } = useNotes();
  const { getMemoryPrompt } = useAIMemory();
  const { user, isLocalMode } = useAuth();
  const todayClasses = useMemo(() => getTodayClasses(), [getTodayClasses]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [localName, setLocalName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const router = useRouter();

  const defaultWidgetOrder = ['todos', 'schedule', 'notes', 'drive', 'links', 'progress'];
  const [widgetOrder, setWidgetOrder] = useState(defaultWidgetOrder);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_widget_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultWidgetOrder.length) {
          setWidgetOrder(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleReorder = (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    localStorage.setItem('dashboard_widget_order', JSON.stringify(newOrder));
  };

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

  useEffect(() => {
    if (isLocalMode) {
      const savedName = localStorage.getItem('studyos_local_name');
      if (savedName) setLocalName(savedName);
      else setIsEditingName(true);
    }
  }, [isLocalMode]);

  const saveLocalName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (localName.trim()) {
      localStorage.setItem('studyos_local_name', localName.trim());
      setIsEditingName(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    if (hour < 20) return 'สวัสดีตอนเย็น';
    return 'สวัสดีตอนค่ำ';
  };

  const { files: workspaceFiles, loading: wsLoading, error: wsError, fetchRecentFiles } = useWorkspace();
  useEffect(() => { fetchRecentFiles(); }, [fetchRecentFiles]);

  const pendingTodos = todos.filter((t) => !t.done);
  const todayTodos = todos.filter((t) => !t.done).slice(0, isMobile ? 3 : 6);
  const completedThisWeek = todos.filter((t) => t.done).length;
  const totalTodos = todos.length;
  const progressPct = totalTodos > 0 ? Math.round((completedThisWeek / totalTodos) * 100) : 0;
  const displayClasses = isMobile ? todayClasses.slice(0, 2) : todayClasses;

  // AI Proactive Alerts
  const alertContext = useMemo(() => ({
    userId: user?.uid || (isLocalMode ? 'local' : ''),
    todos: pendingTodos.map(t => `${t.title} (ส่ง: ${t.dueDate?.toLocaleDateString('th-TH') || '-'})`).join(', '),
    schedule: todayClasses.map(c => `${c.name} ${c.startTime}-${c.endTime}`).join(', '),
    memories: getMemoryPrompt(),
    enabled: pendingTodos.length > 0 || todayClasses.length > 0,
  }), [user?.uid, isLocalMode, pendingTodos, todayClasses, getMemoryPrompt]);
  const { alerts: aiAlerts, loading: alertsLoading, dismissAlert } = useAIAlert(alertContext);

  const aiTools = [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Gemini', url: 'https://gemini.google.com' },
    { name: 'ChatGPT', url: 'https://chatgpt.com' },
    { name: 'Claude', url: 'https://claude.ai' },
    { name: 'NotebookLM', url: 'https://notebooklm.google.com' },
  ];

  const gridCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  const statItems = [
    { icon: IconCheckSquare, value: pendingTodos.length, label: 'งานค้าง', color: 'var(--accent)' },
    { icon: IconCalendar, value: todayClasses.length, label: 'คาบวันนี้', color: 'var(--violet)' },
    { icon: IconFileText, value: notes.length, label: 'โน้ตทั้งหมด', color: 'var(--teal)' },
    { isProgress: true, value: `${progressPct}%`, label: 'ความคืบหน้า', color: 'var(--sky)' },
  ];

  return (
    <div className="animate-in">
      <PWACapsule />
      <AIBanner 
        pendingCount={pendingTodos.length} 
        todos={pendingTodos}
        todayClasses={todayClasses}
        notes={notes.map(n => ({ id: n.id, title: n.title }))}
        memories={getMemoryPrompt()}
        alerts={aiAlerts} 
        loading={alertsLoading} 
        onDismiss={dismissAlert} 
      />
      <WhatsNewPopup />

      {/* Unified Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 10, 
        marginBottom: 24 
      }} className="stagger-children">
        {statItems.map((stat, i) => (
          <div key={i} className="card stat-card mobile-card" style={{ textAlign: 'center', padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {stat.isProgress ? (
              <div style={{ marginBottom: 6 }}>
                <AnimatedProgressCircle progress={progressPct} size={28} strokeWidth={3} />
              </div>
            ) : stat.icon ? (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in srgb, ${stat.color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            ) : null}
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid using Reorder */}
      <Reorder.Group 
        axis="y" 
        values={widgetOrder} 
        onReorder={handleReorder}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: gridCols, 
          gap: 18,
          alignItems: 'start' // Ensure cards don't stretch to fill the grid row if they have different heights
        }} 
        className="stagger-children"
      >
        {widgetOrder.map((widgetId) => {
          if (widgetId === 'todos') {
            return (
              <DraggableWidgetCard key="todos" id="todos" isDraggable={!isMobile} className="card mobile-card" style={isTablet ? { gridColumn: 'span 2' } : {}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconCheckSquare size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>To-Do วันนี้</h3>
                  </div>
                  <Link href="/dashboard/todo" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>ดูทั้งหมด →</Link>
                </div>
                {todayTodos.length === 0 ? (
                  <div className="py-2">
                    <EmptyState 
                      icon={<IconCheckSquare size={28} />}
                      title="ไม่มีงานค้าง"
                      description="ยอดเยี่ยมมาก! วันนี้คุณไม่มีงานที่ต้องทำแล้ว พักผ่อนให้เต็มที่"
                      actionLabel="เพิ่มงานใหม่"
                      onAction={() => router.push('/dashboard/todo?new=1')}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {todayTodos.map((todo) => (
                      <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: todo.priority === 'urgent' ? 'var(--danger)' : 'var(--accent)', flexShrink: 0, boxShadow: `0 0 6px ${todo.priority === 'urgent' ? 'rgba(244,63,94,0.3)' : 'rgba(255,107,26,0.3)'}` }} />
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
                    
                    <div className="mt-6 border-t border-border pt-4">
                      <h4 className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">สถิติงาน (To-Do)</h4>
                      <TaskProgressChart completed={completedThisWeek} pending={pendingTodos.length} />
                    </div>
                  </div>
                )}
              </DraggableWidgetCard>
            );
          }

          if (widgetId === 'schedule') {
            return (
              <DraggableWidgetCard key="schedule" id="schedule" isDraggable={!isMobile} className="card mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--violet-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconCalendar size={16} style={{ color: 'var(--violet)' }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>คาบเรียนวันนี้</h3>
                  </div>
                  <Link href="/dashboard/schedule" style={{ fontSize: 12, color: 'var(--violet)', textDecoration: 'none', fontWeight: 500 }}>ดูตาราง →</Link>
                </div>
                {displayClasses.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>วันนี้ไม่มีคาบเรียน</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {displayClasses.map((cls) => (
                      <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--violet-soft)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <IconClock size={15} style={{ color: 'var(--violet)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{cls.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cls.room} - {cls.teacher}</div>
                        </div>
                        <span className="pill" style={{ fontSize: 10, background: 'var(--violet-soft)', color: 'var(--violet)', border: '1px solid var(--violet)', borderColor: 'rgba(139,92,246,0.2)' }}>{cls.startTime}-{cls.endTime}</span>
                      </div>
                    ))}
                  </div>
                )}
              </DraggableWidgetCard>
            );
          }

          if (widgetId === 'notes') {
            return (
              <DraggableWidgetCard key="notes" id="notes" isDraggable={!isMobile} className="card mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconFileText size={16} style={{ color: 'var(--teal)' }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>โน้ตล่าสุด</h3>
                  </div>
                  <Link href="/dashboard/notes" style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>ดูทั้งหมด →</Link>
                </div>
                {notes.slice(0, 3).map((note) => (
                  <Link key={note.id} href={`/dashboard/notes/${note.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '7px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{note.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                        {note.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </Link>
                ))}
                {notes.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-hint)', textAlign: 'center', padding: 12 }}>ยังไม่มีโน้ต</p>}
              </DraggableWidgetCard>
            );
          }

          if (widgetId === 'drive') {
            return (
              <DraggableWidgetCard key="drive" id="drive" isDraggable={!isMobile} className="card mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--sky-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCloud size={16} style={{ color: 'var(--sky)' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Google Drive</h3>
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
              </DraggableWidgetCard>
            );
          }

          if (widgetId === 'links') {
            return (
              <DraggableWidgetCard key="links" id="links" isDraggable={!isMobile} className="card mobile-card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>ทางลัดระบบ & AI</h3>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>มหาวิทยาลัย</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <a href="http://regis.nsru.ac.th/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: 12 }}>
                      <IconExternalLink size={13} style={{ color: 'var(--accent)' }} />ระบบทะเบียน
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
              </DraggableWidgetCard>
            );
          }

          if (widgetId === 'progress') {
            return (
              <DraggableWidgetCard key="progress" id="progress" isDraggable={!isMobile} className="card mobile-card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Progress สัปดาห์นี้</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>งานเสร็จ</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedThisWeek}/{totalTodos}</span>
                </div>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progressPct}%` }} /></div>
              </DraggableWidgetCard>
            );
          }

          return null;
        })}
      </Reorder.Group>
    </div>
  );
}
