'use client';

import { useState } from 'react';
import { IconExternalLink, IconPlus, IconX, IconSparkle, IconCpu } from '@/components/ui/Icons';

const aiTools = [
  { 
    name: 'Google Gemini', 
    url: 'https://gemini.google.com', 
    color: 'linear-gradient(135deg, #4285F4, #9B72CB)',
    desc: 'AI ทรงพลังจาก Google สำหรับงานทุกประเภท'
  },
  { 
    name: 'ChatGPT', 
    url: 'https://chatgpt.com', 
    color: 'linear-gradient(135deg, #10A37F, #1A7F64)',
    desc: 'แชทบอทอัจฉริยะจาก OpenAI'
  },
  { 
    name: 'NotebookLM', 
    url: 'https://notebooklm.google.com', 
    color: 'linear-gradient(135deg, #4285F4, #34A853)',
    desc: 'ผู้ช่วยวิจัยส่วนตัว สรุปเอกสารจากแหล่งข้อมูล'
  },
  { 
    name: 'Claude AI', 
    url: 'https://claude.ai', 
    color: 'linear-gradient(135deg, #D97757, #B45F42)',
    desc: 'เน้นความถูกต้องและการเขียนที่สละสลวย'
  },
  { 
    name: 'DeepSeek', 
    url: 'https://chat.deepseek.com', 
    color: 'linear-gradient(135deg, #4D8CF4, #2C6AD1)',
    desc: 'AI รุ่นใหม่ที่โดดเด่นด้านการคำนวณและเขียนโค้ด'
  },
  { 
    name: 'Perplexity', 
    url: 'https://www.perplexity.ai', 
    color: 'linear-gradient(135deg, #20B2AA, #008B8B)',
    desc: 'AI สำหรับการค้นหาข้อมูลพร้อมอ้างอิงแหล่งที่มา'
  },
];

const defaultUniLinks = [
  { name: 'ระบบงานสำหรับนักศึกษา (NSRU REG)', url: 'https://regis.nsru.ac.th/apr-login/login/2' },
  { name: 'กองพัฒนานักศึกษา', url: 'https://sd.nsru.ac.th/' },
  { name: 'หอพักนักศึกษา', url: 'https://dorm.nsru.ac.th/' },
  { name: 'NSRU NOC (อินเทอร์เน็ตและเครือข่าย)', url: 'https://noc.nsru.ac.th/' },
  { name: 'หอสมุด NSRU', url: 'https://library.nsru.ac.th/' },
];

export default function AIToolsPage() {
  const [uniLinks, setUniLinks] = useState(defaultUniLinks);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setUniLinks([...uniLinks, { name: newName.trim(), url: newUrl.trim() }]);
    setNewName(''); setNewUrl(''); setShowAdd(false);
  };

  const handleRemove = (index: number) => {
    setUniLinks(uniLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Section */}
      <section style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', 
          background: 'var(--orange-light)', color: 'var(--orange)', borderRadius: 20,
          fontSize: 14, fontWeight: 600, marginBottom: 16
        }}>
          <IconCpu size={16} /> AI Toolset & Connections
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>เครื่องมือ AI และลิงก์ระบบสำคัญ</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          รวบรวมสุดยอดเครื่องมือ AI เพื่อเพิ่มประสิทธิภาพการเรียน และช่องทางด่วนเข้าสู่ระบบต่างๆ ของมหาวิทยาลัย
        </p>
      </section>

      {/* AI Tools Grid */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {aiTools.map((tool) => (
            <a 
              key={tool.name} 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="card ai-tool-card" 
              style={{ 
                textDecoration: 'none', 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, 
                background: 'var(--surface)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid var(--border)'
              }}>
                <img 
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(tool.url).hostname}`} 
                  alt={tool.name}
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tool.name}
                  <IconExternalLink size={14} style={{ color: 'var(--text-hint)', opacity: 0.5 }} />
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
              </div>
              <div className="hover-accent" />
            </a>
          ))}
        </div>
      </section>

      {/* NSRU Quick Links */}
      <section style={{ marginBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--orange)' }}>●</span> ลิงก์ระบบมหาวิทยาลัย (NSRU)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-hint)', marginTop: 4 }}>เข้าถึงระบบการเรียนและบริการต่างๆ ของราชภัฏนครสวรรค์</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize: 13, padding: '10px 16px', background: 'var(--orange)' }}>
            <IconPlus size={14} /> เพิ่มลิงก์ของคุณ
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {uniLinks.map((link, i) => (
            <div key={i} className="card uni-link-item" style={{ 
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              transition: 'background 0.2s'
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: 'var(--cream3)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--orange)', flexShrink: 0
              }}>
                <IconSparkle size={16} />
              </div>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, fontSize: 15, color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                {link.name}
              </a>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                  <IconExternalLink size={16} />
                </a>
                {i >= defaultUniLinks.length && (
                  <button className="btn-icon" onClick={() => handleRemove(i)} style={{ color: 'var(--danger)' }}>
                    <IconX size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {showAdd && (
        <div className="modal-overlay open" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>เพิ่มลิงก์ด่วนใหม่</h3>
              <button className="btn-icon" onClick={() => setShowAdd(false)}><IconX size={18} /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontSize: 13, marginBottom: 6, display: 'block', fontWeight: 500 }}>ชื่อลิงก์หรือระบบ</label>
                <input className="input" placeholder="เช่น: ระบบจดบันทึกของฉัน" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 13, marginBottom: 6, display: 'block', fontWeight: 500 }}>URL</label>
                <input className="input" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleAdd} style={{ marginTop: 8, width: '100%' }}>เพิ่มเข้ารายการ</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-tool-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        .ai-tool-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 4px;
          background: var(--orange);
          transition: width 0.3s;
        }
        .ai-tool-card:hover::after {
          width: 100%;
        }
        .uni-link-item:hover {
          background: var(--cream);
          border-color: var(--orange-light);
        }
      `}</style>
    </div>
  );
}
