'use client';

import { useState } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { IconPlus, IconSearch, IconFileText } from '@/components/ui/Icons';

const NOTE_COLORS = [
  { name: 'ขาว', value: '#FFFFFF' }, { name: 'ครีม', value: '#FBF8F1' },
  { name: 'พีช', value: '#FCE8D5' }, { name: 'ชมพู', value: '#F5DBE5' },
  { name: 'ม่วง', value: '#E5DDF5' }, { name: 'ฟ้า', value: '#D5E5F5' },
  { name: 'เขียว', value: '#D9F0DA' }, { name: 'เหลือง', value: '#FFF3C4' },
];

export default function NotesPage() {
  const { notes, loading, addNote } = useNotes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));

  const filtered = notes.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (subjectFilter && n.subject !== subjectFilter) return false;
    return true;
  });

  const handleNew = async () => {
    const id = await addNote({ title: 'โน้ตใหม่', body: '', subject: '', color: '#FFFFFF' });
    if (id) router.push(`/notes/${id}`);
  };

  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 80 ? text.substring(0, 80) + '...' : text || 'ยังไม่มีเนื้อหา';
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-fade-in">
      {/* Top Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input className="input" placeholder="ค้นหาโน้ต..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button className={`chip ${!subjectFilter ? 'active' : ''}`} onClick={() => setSubjectFilter('')}
            style={!subjectFilter ? { borderColor: 'var(--orange)', color: 'var(--orange)' } : {}}>ทั้งหมด</button>
          {subjects.map((s) => (
            <button key={s} className={`chip ${subjectFilter === s ? 'active' : ''}`} onClick={() => setSubjectFilter(s)}
              style={subjectFilter === s ? { borderColor: 'var(--orange)', color: 'var(--orange)' } : {}}>{s}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={handleNew}>
          <IconPlus size={16} /> สร้างโน้ต
        </button>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-hint)' }}>
          <IconFileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>ยังไม่มีโน้ต</p>
          <button className="btn-primary" onClick={handleNew} style={{ marginTop: 16 }}>
            <IconPlus size={16} /> สร้างโน้ตแรก
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filtered.map((note) => (
            <div key={note.id} className="card" onClick={() => router.push(`/notes/${note.id}`)}
              style={{ cursor: 'pointer', background: note.color || 'var(--surface)', padding: 16, transition: 'transform 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <h4 style={{ fontSize: 15, fontFamily: 'Georgia, serif', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.title}
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getPreview(note.body)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {note.subject && <span className="pill pill-neutral">{note.subject}</span>}
                <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>
                  {note.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
