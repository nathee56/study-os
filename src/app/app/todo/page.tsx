'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTodos, Todo } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { IconSearch, IconPlus, IconCheck, IconTrash, IconFilter, IconSort, IconSparkle, IconCheckSquare, IconChevronRight } from '@/components/ui/Icons';
import { AnimatedCheckbox } from '@/components/ui/AnimatedComponents';

interface AIPriority {
  todoId: string;
  score: number;
  reason: string;
}

export default function TodoPage() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { schedule } = useSchedule();
  
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

  const [aiPriorities, setAiPriorities] = useState<AIPriority[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
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

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTodo({
      title: newTitle.trim(), subject: newSubject, priority: newPriority,
      difficulty: newDifficulty,
      dueDate: newDueDate ? new Date(newDueDate) : null, done: false,
    });
    setNewTitle(''); setNewSubject(''); setNewPriority('normal'); setNewDueDate(''); setNewDifficulty(3);
  };

  const renderTodoItem = (todo: Todo) => {
    const aiRank = aiPriorities.find(p => p.todoId === todo.id);
    return (
      <div key={todo.id} 
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }} 
        className={`animate-in ${todo.done ? 'done' : ''}`}>
        <AnimatedCheckbox checked={todo.done} onChange={() => toggleTodo(todo.id, !todo.done)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }} className={todo.done ? 'line-through' : ''}>{todo.title}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {todo.subject && <span className="pill pill-neutral">{todo.subject}</span>}
            {todo.priority === 'urgent' && <span className="pill pill-danger">ด่วน</span>}
            <span className="pill" style={{ background: 'var(--cream3)', color: 'var(--text-secondary)' }}>ยาก: {todo.difficulty || 3}/5</span>
            {todo.dueDate && (
              <span className="pill pill-warning">
                {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {aiRank && sortBy === 'ai-priority' && !todo.done && (
              <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>✨ {aiRank.reason} ({aiRank.score}pt)</span>
            )}
          </div>
        </div>
        <button className="btn-icon" onClick={() => deleteTodo(todo.id)} style={{ flexShrink: 0 }}>
          <IconTrash size={14} />
        </button>
      </div>
    );
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-in">
        {/* Header - Fixed Overlap Logic */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
              <input className="input" placeholder="ค้นหางาน..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: '100%' }} />
           </div>
           
           <button 
             className="btn-primary" 
             onClick={handleAIPrioritize} 
             disabled={isAnalyzing}
             style={{ background: 'var(--orange)', border: 'none', borderRadius: 12, padding: '0 20px', height: 42, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
           >
             <IconSparkle size={16} className={isAnalyzing ? 'animate-spin' : ''} />
             {isAnalyzing ? 'กำลังวิเคราะห์...' : 'AI จัดลำดับ'}
           </button>
        </div>

        {/* AI Priority Top Card */}
        {sortBy === 'ai-priority' && aiPriorities.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF9A5C)', borderRadius: 20, padding: 18, color: 'white', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconSparkle size={18} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>AI แนะนำให้ทำ 3 สิ่งนี้ก่อน</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiPriorities.slice(0, 3).map((p, i) => {
                const todo = todos.find(t => t.id === p.todoId);
                if (!todo) return null;
                return (
                  <div key={p.todoId} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: 14 }}>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.title}</div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>{p.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters & Sorting */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
           {['all', 'pending', 'urgent', 'done'].map(f => (
             <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f as any)} style={{ whiteSpace: 'nowrap', background: filter === f ? 'var(--accent)' : 'var(--surface-raised)', color: filter === f ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}>
               {{ all: 'ทั้งหมด', pending: 'ค้างอยู่', urgent: 'งานด่วน', done: 'เสร็จแล้ว' }[f]}
             </button>
           ))}
           <div style={{ flex: 1 }} />
           <select className="input" style={{ width: 'auto', minWidth: 120 }} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="dueDate">วันส่ง</option>
              <option value="priority">ความสำคัญ</option>
              <option value="ai-priority">AI Priority</option>
           </select>
        </div>

        {/* Tasks List */}
        <div className="card" style={{ padding: '0 20px' }}>
          {filtered.length === 0 ? <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-hint)' }}>ไม่พบรายการงาน</p> : filtered.map(renderTodoItem)}
        </div>

        {/* Add Task Form */}
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
           <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>เพิ่มงานใหม่</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="ทำอะไรดี..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                 <select className="input" style={{ flex: 1 }} value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                    <option value="">วิชา</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="input" style={{ flex: 1 }} value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                    <option value="normal">ปกติ</option>
                    <option value="urgent">ด่วน</option>
                 </select>
                 <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12 }}>ยาก:</span>
                    <input type="range" min="1" max="5" value={newDifficulty} onChange={e => setNewDifficulty(parseInt(e.target.value))} style={{ flex: 1 }} />
                 </div>
                 <input type="date" className="input" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleAdd} style={{ marginTop: 4 }}>เพิ่มงาน</button>
           </div>
        </div>

        <style jsx>{`
          .pill.active { transform: scale(1.05); }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .line-through { text-decoration: line-through; }
          .opacity-50 { opacity: 0.5; }
        `}</style>
    </div>
  );
}
