'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodos, Todo } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { 
  IconSearch, IconPlus, IconTrash, IconSparkle, IconFilter, 
  IconChevronDown, IconChevronUp, IconCalendar 
} from '@/components/ui/Icons';
import { AnimatedCheckbox } from '@/components/ui/AnimatedComponents';
import EmptyState from '@/components/ui/EmptyState';

interface AIPriority {
  todoId: string;
  score: number;
  reason: string;
}

export default function TodoPage() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { schedule } = useSchedule();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'done'>('all');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'subject' | 'ai-priority'>('dueDate');
  const [isMobile, setIsMobile] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(3);
  const [showOptions, setShowOptions] = useState(false);
  
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [aiPriorities, setAiPriorities] = useState<AIPriority[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleAIPrioritize = async () => {
    const pendingItems = todos.filter(t => !t.done);
    if (pendingItems.length === 0) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todos: pendingItems.map(t => ({
            id: t.id, title: t.title, subject: t.subject,
            dueDate: t.dueDate?.toLocaleDateString('th-TH') || 'ไม่ระบุ',
            priority: t.priority, difficulty: t.difficulty || 3
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiPriorities(data.priorities || []);
        setSortBy('ai-priority');
      }
    } catch (err) {
      console.error('AI Ranking Failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const subjects = useMemo(() => {
    const s = new Set(schedule.map((c) => c.name));
    todos.forEach((t) => { if (t.subject) s.add(t.subject); });
    return Array.from(s);
  }, [schedule, todos]);

  const filtered = useMemo(() => {
    let items = [...todos];
    if (search) items = items.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    if (subjectFilter) items = items.filter((t) => t.subject === subjectFilter);
    
    switch (filter) {
      case 'pending': items = items.filter((t) => !t.done); break;
      case 'urgent': items = items.filter((t) => t.priority === 'urgent' && !t.done); break;
      case 'done': items = items.filter((t) => t.done); break;
    }

    items.sort((a, b) => {
      if (sortBy === 'ai-priority') {
        const scoreA = aiPriorities.find(p => p.todoId === a.id)?.score || 0;
        const scoreB = aiPriorities.find(p => p.todoId === b.id)?.score || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'dueDate') return (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);
      if (sortBy === 'priority') return a.priority === 'urgent' ? -1 : 1;
      return (a.subject || '').localeCompare(b.subject || '');
    });

    return items;
  }, [todos, search, filter, subjectFilter, sortBy, aiPriorities]);

  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter(t => !t.done).length;
    const done = total - pending;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, pending, done, pct };
  }, [todos]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTodo({
      title: newTitle.trim(), subject: newSubject, priority: newPriority,
      difficulty: newDifficulty,
      dueDate: newDueDate ? new Date(newDueDate) : null, done: false,
    });
    setNewTitle(''); setNewSubject(''); setNewPriority('normal'); setNewDueDate(''); setNewDifficulty(3);
    setShowMobileModal(false); setShowOptions(false);
  };

  const focusOrOpen = () => {
    if (isMobile) setShowMobileModal(true);
    else inputRef.current?.focus();
  };

  const renderTodoItem = (todo: Todo) => {
    const aiRank = aiPriorities.find(p => p.todoId === todo.id);
    return (
      <motion.div 
        layout
        key={todo.id} 
        className={`todo-item animate-in ${todo.done ? 'done' : ''}`}
      >
        <AnimatedCheckbox checked={todo.done} onChange={() => toggleTodo(todo.id, !todo.done)} />
        
        <div className="todo-item-content">
          <div className="todo-item-title">{todo.title}</div>
          <div className="todo-item-meta">
            {todo.subject && <span className="pill pill-neutral">{todo.subject}</span>}
            {todo.priority === 'urgent' && <span className="pill pill-danger">ด่วน</span>}
            {todo.dueDate && (
              <span className="pill pill-warning">
                📅 {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {aiRank && sortBy === 'ai-priority' && !todo.done && (
              <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>✨ {aiRank.reason}</span>
            )}
          </div>
        </div>

        <button className="btn-icon todo-delete-btn" onClick={() => deleteTodo(todo.id)}>
          <IconTrash size={14} />
        </button>
      </motion.div>
    );
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="todo-container animate-in">
        {/* Summary Strip */}
        <div className="todo-summary">
          <div className="todo-stat-group">
            <div className="todo-stat">
              <span className="todo-stat-label">ค้างอยู่</span>
              <span className="todo-stat-value">{stats.pending}</span>
            </div>
            <div className="todo-stat">
              <span className="todo-stat-label">เสร็จแล้ว</span>
              <span className="todo-stat-value">{stats.done}</span>
            </div>
          </div>
          <div className="todo-progress-container">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{stats.pct}% สำเร็จ</div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
        </div>

        {/* Action Zone: Search, AI, and Add Task */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <IconSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
                <input className="input" placeholder="ค้นหางานของคุณ..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            
            <button className="btn-primary" onClick={handleAIPrioritize} disabled={isAnalyzing} style={{ background: 'var(--orange)', padding: '0 18px', height: 46 }}>
              <IconSparkle size={16} className={isAnalyzing ? 'animate-spin' : ''} />
              <span className="desktop-only">{isAnalyzing ? 'กำลังวิเคราะห์...' : 'AI จัดลำดับ'}</span>
            </button>

            {isMobile && (
              <button onClick={() => setShowMobileModal(true)} className="btn-primary" style={{ height: 46, padding: '0 16px', borderRadius: 14 }}>
                <IconPlus size={20} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="todo-filters-row">
              <div className="todo-segment-control">
                {['all', 'pending', 'urgent', 'done'].map(f => (
                  <button key={f} className={`todo-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f as any)}>
                    {{ all: 'ทั้งหมด', pending: 'ค้าง', urgent: 'ด่วน', done: 'เสร็จ' }[f]}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flex: isMobile ? 1 : 'unset' }}>
                <select className="input" style={{ flex: isMobile ? 1 : 'unset', width: isMobile ? '100%' : 'auto', height: 40, fontSize: 13, padding: '0 12px' }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                  <option value="">ทุกวิชา</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="input" style={{ flex: isMobile ? 1 : 'unset', width: isMobile ? '100%' : 'auto', height: 40, fontSize: 13, padding: '0 12px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="dueDate">วันส่ง</option>
                    <option value="priority">สำคัญ</option>
                    <option value="ai-priority">AI</option>
                </select>
              </div>
          </div>

          {/* Desktop Quick Add (Moved Up) */}
          {!isMobile && (
            <div style={{ position: 'relative', marginTop: 8 }}>
              <div className="todo-quick-add">
                <IconPlus size={20} style={{ color: 'var(--accent)' }} />
                <input ref={inputRef} className="main-input" placeholder="เพิ่มงานใหม่ตรงนี้..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                    <option value="">วิชา</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                    <option value="normal">ปกติ</option>
                    <option value="urgent">ด่วน</option>
                </select>

                <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />

                <div className="todo-options-toggle" onClick={() => setShowOptions(!showOptions)}>
                  {showOptions ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </div>

                <button className="btn-primary" onClick={handleAdd} style={{ height: 36, padding: '0 16px', borderRadius: 12 }}>เพิ่ม</button>
              </div>

              <AnimatePresence>
                {showOptions && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="todo-options-expanded">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>ความยาก: {newDifficulty}/5</span>
                      <input type="range" min="1" max="5" value={newDifficulty} onChange={e => setNewDifficulty(parseInt(e.target.value))} style={{ flex: 1 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* AI Priority Highlight */}
        {sortBy === 'ai-priority' && aiPriorities.length > 0 && (
          <div style={{ background: 'var(--accent-gradient)', borderRadius: 20, padding: 18, color: 'white', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconSparkle size={18} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>AI จัดลำดับแนะนำให้ทำสิ่งนี้ก่อน</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiPriorities.slice(0, 2).map((p, i) => {
                const todo = todos.find(t => t.id === p.todoId);
                if (!todo) return null;
                return (
                  <div key={p.todoId} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 14 }}>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{todo.title}</div>
                      <div style={{ fontSize: 11, opacity: 0.9 }}>{p.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="todo-list" style={{ marginTop: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 0' }}>
              <EmptyState 
                icon={<IconPlus size={40} />}
                title={search ? "ไม่พบงานที่ค้นหา" : "ไม่มีงานค้างแล้ว"}
                description={search ? "ลองเปลี่ยนคำค้นหาดูใหม่" : "ยอดเยี่ยมมาก! วันนี้คุณจัดการทุกอย่างเสร็จสิ้นแล้ว"}
                actionLabel={!search ? "เพิ่มงานใหม่" : undefined}
                onAction={!search ? focusOrOpen : undefined}
              />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map(renderTodoItem)}
            </AnimatePresence>
          )}
        </div>

        {/* Mobile Modal Portal */}
        {mounted && isMobile && createPortal(
          <AnimatePresence>
            {showMobileModal && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
                <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 450, borderRadius: 32, padding: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>เพิ่มงานใหม่</h3>
                    <button onClick={() => setShowMobileModal(false)} style={{ border: 'none', background: 'none', fontSize: 20 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="input" placeholder="ทำอะไรดี..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="input" style={{ flex: 1 }} value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                        <option value="">วิชา</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="input" style={{ flex: 1 }} value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                        <option value="normal">ปกติ</option>
                        <option value="urgent">ด่วน</option>
                      </select>
                    </div>
                    <input type="date" className="input" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>ความยาก: {newDifficulty}/5</div>
                      <input type="range" min="1" max="5" value={newDifficulty} onChange={e => setNewDifficulty(parseInt(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <button className="btn-primary" onClick={handleAdd} style={{ width: '100%', height: 50, borderRadius: 16 }}>ยืนยันเพิ่มงาน</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
