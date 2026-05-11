'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTodos, Todo } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { IconSearch, IconPlus, IconCheck, IconTrash, IconFilter, IconSort, IconSparkle, IconCheckSquare } from '@/components/ui/Icons';
import { AnimatedCheckbox } from '@/components/ui/AnimatedComponents';

export default function TodoPage() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { schedule } = useSchedule();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'done'>('all');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'subject'>('dueDate');
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(3);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
      if (sortBy === 'dueDate') return (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);
      if (sortBy === 'priority') return a.priority === 'urgent' ? -1 : 1;
      return (a.subject || '').localeCompare(b.subject || '');
    });
    return items;
  }, [todos, search, filter, subjectFilter, sortBy]);

  const urgentTodos = filtered.filter((t) => t.priority === 'urgent' && !t.done);
  const pendingTodos = filtered.filter((t) => t.priority !== 'urgent' && !t.done);
  const doneTodos = filtered.filter((t) => t.done);
  const doneCount = todos.filter((t) => t.done).length;
  const pct = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTodo({
      title: newTitle.trim(), subject: newSubject, priority: newPriority,
      difficulty: newDifficulty,
      dueDate: newDueDate ? new Date(newDueDate) : null, done: false,
    });
    setNewTitle(''); setNewSubject(''); setNewPriority('normal'); setNewDueDate(''); setNewDifficulty(3);
  };

  // Mobile card-style todo item
  const renderMobileTodoItem = (todo: Todo) => (
    <div key={todo.id} className="mobile-todo-card animate-in" style={{ opacity: todo.done ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <AnimatedCheckbox checked={todo.done} onChange={() => toggleTodo(todo.id, !todo.done)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }} className={todo.done ? 'line-through' : ''}>{todo.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {todo.subject && <span className="pill pill-neutral">{todo.subject}</span>}
            {todo.priority === 'urgent' && <span className="pill pill-danger">ด่วน</span>}
            {todo.dueDate && (
              <span className="pill pill-warning">
                {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <button className="btn-icon" onClick={() => deleteTodo(todo.id)} style={{ flexShrink: 0, width: 44, height: 44 }}>
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );

  // Desktop list-style todo item
  const renderDesktopTodoItem = (todo: Todo) => (
    <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }} className="animate-in">
      <AnimatedCheckbox checked={todo.done} onChange={() => toggleTodo(todo.id, !todo.done)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }} className={todo.done ? 'line-through' : ''}>{todo.title}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {todo.subject && <span className="pill pill-neutral">{todo.subject}</span>}
          {todo.priority === 'urgent' && <span className="pill pill-danger">ด่วน</span>}
          <span className="pill" style={{ background: 'var(--cream3)', color: 'var(--text-secondary)' }}>
            ยาก: {todo.difficulty || 3}/5
          </span>
          {todo.dueDate && (
            <span className="pill pill-warning">
              {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <button className="btn-icon" onClick={() => deleteTodo(todo.id)} style={{ flexShrink: 0 }}>
        <IconTrash size={14} />
      </button>
    </div>
  );

  const renderTodoItem = (todo: Todo) => isMobile ? renderMobileTodoItem(todo) : renderDesktopTodoItem(todo);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const filterChips = [
    { key: 'all' as const, label: 'ทั้งหมด' },
    { key: 'pending' as const, label: 'ยังไม่เสร็จ' },
    { key: 'urgent' as const, label: 'ด่วน' },
    { key: 'done' as const, label: 'เสร็จแล้ว' },
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', gap: 24 }}>
      {/* Filter Panel - Desktop */}
      <div className="card" style={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 92 }}
        id="filter-panel-desktop">
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>
          <IconFilter size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />กรอง
        </h3>
        {['all', 'pending', 'urgent', 'done'].map((f) => (
          <button key={f} className={`nav-item ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f as typeof filter)}
            style={{ width: '100%', margin: '2px 0', padding: '8px 12px' }}>
            {{ all: 'ทั้งหมด', pending: 'ยังไม่เสร็จ', urgent: 'ด่วน', done: 'เสร็จแล้ว' }[f]}
          </button>
        ))}

        <div style={{ margin: '12px 0', borderTop: '0.5px solid var(--border)' }} />
        <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>กรองตามวิชา</h4>
        <button className={`nav-item ${!subjectFilter ? 'active' : ''}`}
          onClick={() => setSubjectFilter('')}
          style={{ width: '100%', margin: '2px 0', padding: '8px 12px', fontSize: 13 }}>ทุกวิชา</button>
        {subjects.map((s) => (
          <button key={s} className={`nav-item ${subjectFilter === s ? 'active' : ''}`}
            onClick={() => setSubjectFilter(s)}
            style={{ width: '100%', margin: '2px 0', padding: '8px 12px', fontSize: 13 }}>{s}</button>
        ))}

        <div style={{ margin: '12px 0', borderTop: '0.5px solid var(--border)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>เสร็จ</span>
          <span style={{ fontWeight: 600 }}>{doneCount}/{todos.length}</span>
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>

        {/* AI Study Planner */}
        <div style={{ marginTop: 24, padding: 20, background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--orange-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <IconSparkle size={16} style={{ color: 'var(--orange)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>AI Study Planner</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            ให้ AI ช่วยจัดตารางการอ่านหนังสือให้คุณตามความยากและวันส่ง
          </p>
          <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: 12 }}
            onClick={() => window.location.href = `/app/ai?q=${encodeURIComponent('ช่วยวางแผนการทำงานและอ่านหนังสือจากรายการ To-Do ของฉันให้หน่อย ควรเริ่มจากอันไหนก่อนดี?')}`}>
            วางแผนให้ฉันที
          </button>
        </div>
      </div>

      {/* Main List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile Filter Chips */}
        {isMobile && (
          <div className="mobile-filter-chips" style={{ marginBottom: 16 }}>
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                className={`chip ${filter === chip.key ? 'chip-active' : ''}`}
                onClick={() => setFilter(chip.key)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  flexShrink: 0,
                  background: filter === chip.key ? 'var(--orange)' : 'var(--surface)',
                  color: filter === chip.key ? '#fff' : 'var(--text-secondary)',
                  border: filter === chip.key ? '1px solid var(--orange)' : '0.5px solid var(--border-strong)',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
            <input className="input" placeholder="ค้นหางาน..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          {!isMobile && (
            <select className="input" style={{ width: 'auto', minWidth: 120, cursor: 'pointer' }} value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="dueDate">วันส่ง</option>
              <option value="priority">ความสำคัญ</option>
              <option value="subject">วิชา</option>
            </select>
          )}
        </div>

        {/* Urgent Section */}
        {urgentTodos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 className="mobile-section-label" style={{ fontSize: isMobile ? 11 : 13, color: 'var(--danger)', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.5px' : 'normal' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} /> ด่วน
            </h4>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{urgentTodos.map(renderTodoItem)}</div>
            ) : (
              <div className="card" style={{ padding: '0 16px' }}>{urgentTodos.map(renderTodoItem)}</div>
            )}
          </div>
        )}

        {/* Pending Section */}
        {pendingTodos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 className="mobile-section-label" style={{ fontSize: isMobile ? 11 : 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.5px' : 'normal' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} /> งานค้างอยู่
            </h4>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{pendingTodos.map(renderTodoItem)}</div>
            ) : (
              <div className="card" style={{ padding: '0 16px' }}>{pendingTodos.map(renderTodoItem)}</div>
            )}
          </div>
        )}

        {/* Done Section */}
        {doneTodos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 className="mobile-section-label" style={{ fontSize: isMobile ? 11 : 13, color: 'var(--text-hint)', marginBottom: 12, fontWeight: 600, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.5px' : 'normal' }}>เสร็จแล้ว</h4>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{doneTodos.map(renderTodoItem)}</div>
            ) : (
              <div className="card" style={{ padding: '0 16px', opacity: 0.7 }}>{doneTodos.map(renderTodoItem)}</div>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-hint)' }}>
            <IconCheckSquare size={48} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p style={{ fontSize: 14 }}>ไม่พบรายการงาน</p>
          </div>
        )}

        {/* Add Row */}
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>เพิ่มงานใหม่</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input className="input" placeholder="หัวข้อวิชา/งาน..." value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              style={isMobile ? {} : { gridColumn: 'span 3' }} />
            <select className="input" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
              <option value="">เลือกวิชา</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input" value={newPriority} onChange={(e) => setNewPriority(e.target.value as 'normal' | 'urgent')}>
              <option value="normal">ความสำคัญปกติ</option>
              <option value="urgent">ความสำคัญสูง (ด่วน)</option>
            </select>
            {!isMobile && (
              <select className="input" value={newDifficulty} onChange={(e) => setNewDifficulty(Number(e.target.value))}>
                <option value={1}>ระดับความยาก: 1 (ง่ายมาก)</option>
                <option value={2}>ระดับความยาก: 2 (ง่าย)</option>
                <option value={3}>ระดับความยาก: 3 (ปกติ)</option>
                <option value={4}>ระดับความยาก: 4 (ยาก)</option>
                <option value={5}>ระดับความยาก: 5 (ยากมาก)</option>
              </select>
            )}
            <input type="date" className="input" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            {!isMobile && <div style={{ gridColumn: 'span 2' }}></div>}
            <button className="btn-primary" onClick={handleAdd} style={{ width: '100%', minHeight: 44 }}>
              <IconPlus size={16} /> เพิ่มงาน
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          #filter-panel-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
