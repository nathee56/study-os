'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { IconCloud, IconExternalLink, IconSparkle, IconFolder, IconArrowLeft } from '@/components/ui/Icons';
import { useRouter } from 'next/navigation';

export default function DrivePage() {
  const { files, loading, error, listFiles, fetchFileContent } = useWorkspace();
  const [readingFile, setReadingFile] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<{ id: string; name: string }>({ id: 'root', name: 'Google Drive' });
  const [history, setHistory] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    listFiles(currentFolder.id);
  }, [currentFolder.id, listFiles]);

  const handleReadByAI = async (fileId: string, mimeType: string, fileName: string) => {
    try {
      setReadingFile(fileId);
      const content = await fetchFileContent(fileId, mimeType);
      sessionStorage.setItem('ai_file_context', JSON.stringify({ name: fileName, content }));
      router.push('/ai?fromFile=true');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์');
    } finally {
      setReadingFile(null);
    }
  };

  const navigateToFolder = (id: string, name: string) => {
    setHistory([...history, currentFolder]);
    setCurrentFolder({ id, name });
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(history.slice(0, -1));
      setCurrentFolder(prev);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <IconCloud style={{ color: '#4285F4' }} size={28} />
            {currentFolder.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>จัดการไฟล์และให้ AI ช่วยสรุปเนื้อหา</p>
        </div>
        {history.length > 0 && (
          <button onClick={goBack} className="btn-ghost" style={{ fontSize: 13, gap: 4 }}>
            <IconArrowLeft size={16} /> กลับไปก่อนหน้า
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => listFiles(currentFolder.id)} style={{ marginTop: 12, background: 'var(--danger)' }}>ลองอีกครั้ง</button>
        </div>
      ) : files.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-hint)' }}>
          <IconCloud size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p>ไม่พบไฟล์หรือโฟลเดอร์ในหน้านี้</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {files.map((file) => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div 
                key={file.id} 
                className="card drive-item-card" 
                style={{ 
                  padding: 16, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  cursor: isFolder ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onClick={() => isFolder && navigateToFolder(file.id, file.name)}
              >
                <div style={{ marginBottom: 12, position: 'relative' }}>
                  {isFolder ? (
                    <IconFolder size={48} style={{ color: '#FFD04B' }} />
                  ) : (
                    <img src={file.iconLink} alt="" style={{ width: 48, height: 48 }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <h3 style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                    {file.name}
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                    {new Date(file.modifiedTime).toLocaleDateString('th-TH')}
                  </p>
                </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 12, width: '100%' }}>
                    {(file.mimeType === 'application/vnd.google-apps.document' || file.mimeType === 'application/pdf' || isFolder) ? (
                      <button 
                        className="btn-primary" 
                        style={{ flex: 1, padding: '4px 8px', fontSize: 11, background: 'var(--orange)' }}
                        onClick={(e) => { e.stopPropagation(); handleReadByAI(file.id, file.mimeType, file.name); }}
                        disabled={readingFile === file.id}
                      >
                        {readingFile === file.id ? '...' : <><IconSparkle size={12} /> {isFolder ? 'AI สรุปโฟลเดอร์' : 'ให้ AI อ่าน'}</>}
                      </button>
                    ) : (
                      <a 
                        href={file.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-ghost" 
                        style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconExternalLink size={14} /> เปิดไฟล์
                      </a>
                    )}
                  </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .drive-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border-color: var(--orange-light);
        }
      `}</style>
    </div>
  );
}
