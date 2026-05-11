'use client';

import { useState } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { IconPlus, IconSearch, IconFileText } from '@/components/ui/Icons';

const NOTE_COLORS = [
  { name: 'ขาว', value: 'var(--note-white)' }, { name: 'ครีม', value: 'var(--note-cream)' },
  { name: 'พีช', value: 'var(--note-peach)' }, { name: 'ชมพู', value: 'var(--note-pink)' },
  { name: 'ม่วง', value: 'var(--note-lavender)' }, { name: 'ฟ้า', value: 'var(--note-blue)' },
  { name: 'เขียว', value: 'var(--note-green)' }, { name: 'เหลือง', value: 'var(--note-yellow)' },
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
    const id = await addNote({ title: 'โน้ตใหม่', body: '', subject: '', color: 'var(--note-white)' });
    if (id) router.push(`/dashboard/notes/${id}`);
  };

  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 80 ? text.substring(0, 80) + '...' : text || 'ยังไม่มีเนื้อหา';
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 24 }} />;

  return (
    <div className="animate-in">
      <style>{`
        .note-card-enhanced {
          border-radius: 20px !important;
          overflow: hidden;
          transition: border-color 0.2s ease;
          box-shadow: none !important;
        }
        .note-card-enhanced:hover {
          border-color: var(--border-strong);
        }
        .filter-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Top Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-container" style={{ flex: 1, minWidth: 200, position: 'relative', transition: 'transform 0.2s' }}>
          <IconSearch size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input className="input" placeholder="ค้นหาโน้ต..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 44, borderRadius: 999, height: 48, background: 'var(--surface-card)', border: '1px solid var(--border-strong)' }} />
        </div>
        <div className="filter-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingRight: 4 }}>
          <button className={`chip ${!subjectFilter ? 'active' : ''}`} onClick={() => setSubjectFilter('')}
            style={!subjectFilter ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)', fontWeight: 600, padding: '10px 18px' } : { padding: '10px 18px', background: 'var(--surface-card)' }}>ทั้งหมด</button>
          {subjects.map((s) => (
            <button key={s} className={`chip ${subjectFilter === s ? 'active' : ''}`} onClick={() => setSubjectFilter(s)}
              style={subjectFilter === s ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)', fontWeight: 600, padding: '10px 18px' } : { padding: '10px 18px', background: 'var(--surface-card)' }}>{s}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={handleNew} style={{ height: 48, padding: '0 24px', whiteSpace: 'nowrap' }}>
          <IconPlus size={18} /> สร้างโน้ต
        </button>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-hint)' }}>
          <div style={{ 
            width: 88, height: 88, borderRadius: '50%', 
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
          }}>
            <IconFileText size={36} style={{ color: 'var(--accent)', opacity: 0.8 }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>ยังไม่มีโน้ต</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 280, margin: '0 auto 24px', lineHeight: 1.6 }}>สร้างโน้ตแรกเพื่อเริ่มบันทึกไอเดียและการเรียนของคุณ</p>
          <button className="btn-primary" onClick={handleNew} style={{ height: 48, padding: '0 28px' }}>
            <IconPlus size={18} /> สร้างโน้ตแรก
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((note) => (
            <div 
              key={note.id} 
              className="card note-card-enhanced" 
              onClick={() => handleNoteClick(note.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNoteClick(note.id); }}
              style={{ 
                cursor: 'pointer', 
                background: note.color || 'var(--surface-card)', 
                padding: 24,
                border: '1px solid var(--border)',
                borderLeft: `6px solid ${
                  note.color === 'var(--note-peach)' ? 'var(--accent)' :
                  note.color === 'var(--note-pink)' ? 'var(--rose)' :
                  note.color === 'var(--note-lavender)' ? 'var(--violet)' :
                  note.color === 'var(--note-blue)' ? 'var(--sky)' :
                  note.color === 'var(--note-green)' ? 'var(--teal)' :
                  note.color === 'var(--note-yellow)' ? 'var(--amber)' :
                  'var(--border-strong)'
                }`,
              }}
            >
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                {note.title}
              </h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getPreview(note.body)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {note.subject ? (
                  <span className="pill pill-neutral" style={{ background: 'var(--surface-base)', padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>{note.subject}</span>
                ) : <span />}
                <span style={{ fontSize: 12, color: 'var(--text-hint)', fontWeight: 500 }}>
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
