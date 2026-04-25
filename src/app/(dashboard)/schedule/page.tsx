'use client';

import { useState, useMemo } from 'react';
import { useSchedule, ScheduleItem } from '@/lib/hooks/useSchedule';
import { MODELS, callLLM } from '@/lib/thaillm';
import { IconPlus, IconX, IconSparkle, IconUpload, IconClock, IconTrash } from '@/components/ui/Icons';

const DAYS: { key: ScheduleItem['day']; label: string }[] = [
  { key: 'mon', label: 'จันทร์' }, { key: 'tue', label: 'อังคาร' },
  { key: 'wed', label: 'พุธ' }, { key: 'thu', label: 'พฤหัสบดี' },
  { key: 'fri', label: 'ศุกร์' }, { key: 'sat', label: 'เสาร์' },
  { key: 'sun', label: 'อาทิตย์' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = 8 + i;
  return `${h.toString().padStart(2, '0')}:30`;
});

export default function SchedulePage() {
  const { schedule, loading, addClass, deleteClass, deleteAllClasses, addBulkClasses } = useSchedule();
   const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [form, setForm] = useState({ code: '', name: '', day: 'mon' as ScheduleItem['day'], startTime: '08:30', endTime: '10:30', room: '', teacher: '', color: '', semester: '2/2568' });

  const totalClasses = schedule.length;
  const uniqueDays = new Set(schedule.map((s) => s.day)).size;

  const getClassForSlot = (day: ScheduleItem['day'], hour: string) => {
    return schedule.find((s) => {
      const st = parseInt(s.startTime.split(':')[0]) * 60 + parseInt(s.startTime.split(':')[1]);
      const et = parseInt(s.endTime.split(':')[0]) * 60 + parseInt(s.endTime.split(':')[1]);
      const h = parseInt(hour.split(':')[0]) * 60 + parseInt(hour.split(':')[1]);
      return s.day === day && h >= st && h < et;
    });
  };

  const getClassSpan = (cls: ScheduleItem, hour: string) => {
    const st = parseInt(cls.startTime.split(':')[0]) * 60 + parseInt(cls.startTime.split(':')[1]);
    const h = parseInt(hour.split(':')[0]) * 60 + parseInt(hour.split(':')[1]);
    if (h === st) {
      const et = parseInt(cls.endTime.split(':')[0]) * 60 + parseInt(cls.endTime.split(':')[1]);
      return Math.ceil((et - st) / 60);
    }
    return 0;
  };

  const isLunch = (hour: string) => hour === '11:30';

  const handleSubmit = async () => {
    await addClass(form);
    setForm({ code: '', name: '', day: 'mon', startTime: '08:30', endTime: '10:30', room: '', teacher: '', color: '', semester: '2/2568' });
    setShowModal(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: `อ่านตารางเรียนในรูปนี้และแปลงเป็น JSON array โดยแต่ละ object มี: day (mon/tue/wed/thu/fri/sat/sun), startTime, endTime, code, name, room, teacher\n\nรูป base64: ${base64.substring(0, 500)}...` }
            ],
            model: 'openthaigpt-thaillm-8b-instruct-v7.2',
          }),
        });
        const data = await res.json();
        try {
          let contentStr = data.content;
          if (contentStr.includes('```json')) {
            contentStr = contentStr.split('```json')[1].split('```')[0].trim();
          } else if (contentStr.includes('```')) {
            contentStr = contentStr.split('```')[1].split('```')[0].trim();
          }
          const parsed = JSON.parse(contentStr);
          if (Array.isArray(parsed)) {
            await addBulkClasses(parsed.map((p: Record<string, string>) => ({ ...p, semester: '2/2568', color: '' } as unknown as Omit<ScheduleItem, 'id'>)));
          }
        } catch { console.log('Could not parse AI response'); }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch { setScanning(false); }
  };

  const handleTextScan = async () => {
    if (!textInput.trim()) return;
    setScanning(true);
    try {
      const response = await callLLM(MODELS.openthaigpt, [
        { role: 'system', content: 'คุณเป็นผู้ช่วยจัดตารางเรียน แปลงข้อความที่ผู้ใช้ให้มาเป็นข้อมูลตารางเรียน JSON Array เท่านั้น' },
        { role: 'user', content: `แปลงข้อความนี้เป็น JSON Array โดยใช้รูปแบบ: [{ "code": "รหัส", "name": "ชื่อ", "day": "mon/tue/wed/thu/fri/sat/sun", "startTime": "HH:MM", "endTime": "HH:MM", "room": "ห้อง", "teacher": "อาจารย์" }]\n\nข้อความ: ${textInput}` }
      ]);
      
      let contentStr = response.choices[0].message.content;
      if (contentStr.includes('```json')) {
        contentStr = contentStr.split('```json')[1].split('```')[0].trim();
      } else if (contentStr.includes('```')) {
        contentStr = contentStr.split('```')[1].split('```')[0].trim();
      }
      
      const parsed = JSON.parse(contentStr);
      if (Array.isArray(parsed)) {
        await addBulkClasses(parsed.map((p: any) => ({ ...p, semester: '2/2568', color: '' })));
        setTextInput('');
        setShowUpload(false);
      }
    } catch (err) {
      console.error('Text scan error:', err);
      alert('ไม่สามารถประมวลผลข้อความได้ โปรดตรวจสอบรูปแบบข้อมูล');
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-fade-in">
      {/* AI Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--cream)', borderRadius: 8, marginBottom: 16 }}>
        <IconSparkle size={16} style={{ color: 'var(--orange)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          สัปดาห์นี้มี {totalClasses} คาบเรียน {uniqueDays} วัน
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus size={16} /> เพิ่มวิชา
        </button>
        <button className="btn-ghost" onClick={() => setShowUpload(!showUpload)}>
          <IconUpload size={16} /> สแกนตาราง AI
        </button>
        {schedule.length > 0 && (
          <button className="btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => confirm('ล้างตารางเรียนทั้งหมดใช่หรือไม่?') && deleteAllClasses()}>
            <IconTrash size={16} /> ล้างตาราง
          </button>
        )}
      </div>

      {/* Upload Bar */}
      {showUpload && (
        <div className="card" style={{ marginBottom: 16, padding: 16, border: '2px dashed var(--border)' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📸 สแกนจากรูปภาพ</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>อัปโหลดรูปตารางเรียน แล้ว AI จะอ่านข้อมูลให้เอง</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="input" style={{ fontSize: 12 }} />
            </div>
            <div style={{ flex: '1 1 300px', borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>✍️ ใส่ข้อมูลแบบข้อความ</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>วางสรุปตารางเรียนของคุณที่นี่ (เช่น: จันทร์ 8:30-10:30 คณิต ห้อง 101)</p>
              <textarea 
                className="input" 
                placeholder="พิมพ์หรือวางข้อมูลตารางเรียนที่นี่..." 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{ height: 80, fontSize: 12, resize: 'none', marginBottom: 8 }}
              />
              <button 
                className="btn-primary" 
                style={{ width: '100%', fontSize: 12, padding: '10px' }}
                onClick={handleTextScan}
                disabled={scanning || !textInput.trim()}
              >
                {scanning ? 'กำลังประมวลผล...' : 'จัดตารางด้วย AI'}
              </button>
            </div>
          </div>
          {scanning && <p style={{ fontSize: 12, color: 'var(--orange)', marginTop: 12, textAlign: 'center' }}>AI กำลังจัดตารางเรียนให้คุณ โปรดรอสักครู่...</p>}
        </div>
      )}

      {/* Timetable */}
      <div className="card" style={{ padding: '16px 0', overflow: 'hidden', maxWidth: '100%' }}>
        <div style={{ overflowX: 'auto', paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}>
          <div className="timetable" style={{ gridTemplateColumns: `80px repeat(${HOURS.length}, minmax(80px, 1fr))`, minWidth: 1000 }}>
          {/* Header */}
          <div className="timetable-header" />
          {HOURS.map((h) => (
            <div key={h} className="timetable-header" style={isLunch(h) ? { background: 'var(--cream3)' } : {}}>
              {h}
            </div>
          ))}

          {/* Rows */}
          {DAYS.map((day) => {
            const rendered = new Set<string>();
            return (
              <div key={day.key} style={{ display: 'contents' }}>
                <div className="timetable-day-label">{day.label}</div>
                {HOURS.map((hour) => {
                  if (isLunch(hour)) {
                    return <div key={hour} className="timetable-cell lunch-block">พักเที่ยง</div>;
                  }
                  const cls = getClassForSlot(day.key, hour);
                  if (cls && rendered.has(cls.id)) return null;
                  if (cls) {
                    rendered.add(cls.id);
                    const span = getClassSpan(cls, hour);
                    if (span === 0) return <div key={hour} className="timetable-cell" />;
                    return (
                      <div key={hour} className="timetable-cell" style={{ gridColumn: `span ${span}` }}
                        onClick={() => setSelectedClass(cls)}>
                        <div className="class-block" style={{ background: cls.color || 'var(--class-1)' }}>
                          <div style={{ fontWeight: 600, fontSize: 11 }}>{cls.code}</div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>{cls.name}</div>
                          <div style={{ fontSize: 9, opacity: 0.6 }}>{cls.room}</div>
                        </div>
                      </div>
                    );
                  }
                  return <div key={hour} className="timetable-cell" />;
                })}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* Class Detail Popup */}
      {selectedClass && (
        <div className="modal-overlay open" onClick={() => setSelectedClass(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>{selectedClass.name}</h3>
              <button className="btn-icon" onClick={() => setSelectedClass(null)}><IconX size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><span style={{ fontSize: 12, color: 'var(--text-hint)' }}>รหัสวิชา:</span> <span style={{ fontSize: 14 }}>{selectedClass.code}</span></div>
              <div><span style={{ fontSize: 12, color: 'var(--text-hint)' }}>เวลา:</span> <span style={{ fontSize: 14 }}>{selectedClass.startTime} - {selectedClass.endTime}</span></div>
              <div><span style={{ fontSize: 12, color: 'var(--text-hint)' }}>ห้อง:</span> <span style={{ fontSize: 14 }}>{selectedClass.room}</span></div>
              <div><span style={{ fontSize: 12, color: 'var(--text-hint)' }}>อาจารย์:</span> <span style={{ fontSize: 14 }}>{selectedClass.teacher}</span></div>
              <button className="btn-ghost" style={{ marginTop: 8, color: 'var(--danger)' }}
                onClick={async () => { await deleteClass(selectedClass.id); setSelectedClass(null); }}>
                <IconX size={14} /> ลบวิชานี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>เพิ่มวิชา</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><IconX size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="รหัสวิชา" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <input className="input" placeholder="ชื่อวิชา" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as ScheduleItem['day'] })}>
                {DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                <input type="time" className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <input className="input" placeholder="ห้อง" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              <input className="input" placeholder="อาจารย์" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
              <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 4 }}>เพิ่มวิชา</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
