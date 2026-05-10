'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { IconMail, IconCloud, IconCalendar, IconImage, IconExternalLink, IconAlertCircle } from '@/components/ui/Icons';

function ServiceSection({ title, icon: Icon, serviceName, renderContent }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { signIn } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/google/${serviceName}`);
        const result = await res.json();
        
        if (!res.ok) {
          if (result.connectUrl || result.error === 'Unauthorized') {
            setError('unauthorized');
          } else {
            setError('error');
          }
        } else {
          setData(result);
        }
      } catch (err) {
        setError('error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [serviceName]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ padding: 8, background: 'var(--surface-raised)', borderRadius: 8 }}>
          <Icon size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : error === 'unauthorized' ? (
        <div style={{ padding: 30, textAlign: 'center', background: 'var(--surface)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          <IconAlertCircle size={32} style={{ color: 'var(--text-hint)', margin: '0 auto 12px' }} />
          <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
            ไม่พบสิทธิ์การเข้าถึงข้อมูล {title}
          </p>
          <button className="btn-primary" onClick={signIn} style={{ margin: '0 auto' }}>
            เชื่อมต่อ Google {title.split(' ')[1] || title}
          </button>
        </div>
      ) : error ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--danger)' }}>
          เกิดข้อผิดพลาดในการดึงข้อมูล
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {renderContent(data)}
        </div>
      )}
    </div>
  );
}

export default function GoogleWorkspacePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>กรุณาเข้าสู่ระบบด้วย Google</h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Google Workspace</h1>
        <p style={{ color: 'var(--text-secondary)' }}>ดูข้อมูลและทำงานร่วมกับบริการของ Google ได้โดยตรงจาก JamDai</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <ServiceSection
          title="Gmail"
          icon={IconMail}
          serviceName="gmail"
          renderContent={(data: any) => {
            if (!data?.messages || data.messages.length === 0) return <div style={{ color: 'var(--text-hint)' }}>ไม่มีอีเมลใหม่</div>;
            return data.messages.map((msg: any) => (
              <a key={msg.id} href={msg.url} target="_blank" rel="noreferrer" className="nav-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 12, borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{msg.subject}</span>
                  <IconExternalLink size={14} style={{ color: 'var(--text-hint)' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>จาก: {msg.from}</div>
                <div style={{ fontSize: 12, color: 'var(--text-hint)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {msg.snippet}
                </div>
              </a>
            ));
          }}
        />

        <ServiceSection
          title="Google Drive"
          icon={IconCloud}
          serviceName="drive"
          renderContent={(data: any) => {
            if (!data?.files || data.files.length === 0) return <div style={{ color: 'var(--text-hint)' }}>ไม่มีไฟล์ล่าสุด</div>;
            return data.files.map((file: any) => (
              <a key={file.id} href={file.webViewLink} target="_blank" rel="noreferrer" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{file.mimeType.split('.').pop()}</div>
                </div>
                <IconExternalLink size={16} style={{ color: 'var(--text-hint)', flexShrink: 0 }} />
              </a>
            ));
          }}
        />

        <ServiceSection
          title="Google Calendar"
          icon={IconCalendar}
          serviceName="calendar"
          renderContent={(data: any) => {
            if (!data?.items || data.items.length === 0) return <div style={{ color: 'var(--text-hint)' }}>ไม่มีกิจกรรมเร็วๆ นี้</div>;
            return data.items.map((event: any) => {
              const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
              const isAllDay = !event.start.dateTime;
              return (
                <a key={event.id} href={event.htmlLink} target="_blank" rel="noreferrer" className="nav-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 40, textAlign: 'center', background: 'var(--cream3)', borderRadius: 8, padding: '4px 0', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>{start.toLocaleDateString('th-TH', { month: 'short' })}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{start.getDate()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{event.summary || '(ไม่มีชื่อเรื่อง)'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {isAllDay ? 'ตลอดวัน' : start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </a>
              );
            });
          }}
        />

        <ServiceSection
          title="Google Photos"
          icon={IconImage}
          serviceName="photos"
          renderContent={(data: any) => {
            if (!data?.mediaItems || data.mediaItems.length === 0) return <div style={{ color: 'var(--text-hint)' }}>ไม่มีรูปล่าสุด</div>;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {data.mediaItems.slice(0, 6).map((item: any) => (
                  <a key={item.id} href={item.productUrl} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={`${item.baseUrl}=w200-h200-c`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
