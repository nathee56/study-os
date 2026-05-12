'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';
import { useCamera } from '@/lib/hooks/useCamera';
import { useNotes } from '@/lib/hooks/useNotes';
import { 
  IconCamera, IconPhoto, IconRefresh, IconCheck, 
  IconX, IconLoader2, IconSparkles, IconFileText 
} from '@/components/ui/Icons';

export default function ScanPage() {
  const router = useRouter();
  const { videoRef, startCamera, stopCamera, captureImage, error: cameraError } = useCamera();
  const { addNote } = useNotes();

  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'idle' | 'ocr' | 'ai'>('idle');
  const [ocrText, setOcrText] = useState('');
  const [result, setResult] = useState<{ title: string; body: string; subject: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      startCamera();
      hasStartedRef.current = true;
    }
    return () => {
      stopCamera();
      hasStartedRef.current = false;
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imgData = captureImage();
    if (imgData) {
      setImage(imgData);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setOcrText('');
    setProcessStep('idle');
    startCamera();
  };

  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProcessStep('ocr');

    try {
      // 1. OCR Step
      const worker = await createWorker('tha+eng');
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      setOcrText(text);
      setProcessStep('ai');

      // 2. AI Format Step
      const res = await fetch('/api/ai/ocr-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('AI formatting failed');
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Processing error:', err);
      alert('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToNotes = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const id = await addNote({
        title: result.title,
        body: result.body,
        subject: result.subject,
        color: 'var(--note-blue)'
      });
      if (id) router.push(`/app/notes/${id}`);
    } catch (err) {
      console.error('Save error:', err);
      alert('ไม่สามารถบันทึกโน้ตได้');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 120 }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>สแกนเป็นโน้ต</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          ถ่ายรูปกระดานหรือเอกสารเพื่อแปลงเป็นโน้ตอัจฉริยะ
        </p>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '3/4', 
        background: '#000', 
        borderRadius: 24, 
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {!image ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {cameraError && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', color: '#fff' }}>
                <p>{cameraError}</p>
              </div>
            )}
            
            {/* Camera Controls Overlay */}
            <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IconPhoto size={24} />
              </button>
              <button 
                onClick={handleCapture}
                style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
              <div style={{ width: 48 }} /> {/* Spacer */}
            </div>
          </>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Processing Overlay */}
            {isProcessing && (
              <div style={{ 
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', 
                backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', color: '#fff' 
              }}>
                <div style={{ position: 'relative', marginBottom: 24 }}>
                  <IconLoader2 size={48} className="animate-spin" />
                  <IconSparkles size={20} style={{ position: 'absolute', top: -10, right: -10, color: 'var(--amber)' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  {processStep === 'ocr' ? 'กำลังอ่านข้อความ...' : 'AI กำลังจัดรูปแบบโน้ต...'}
                </h3>
                <p style={{ opacity: 0.7, fontSize: 14 }}>กรุณารอสักครู่...</p>
                
                {/* Scan line effect */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2, 
                  background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
                  boxShadow: '0 0 15px var(--accent)',
                  animation: 'scanMove 2s infinite ease-in-out'
                }} />
              </div>
            )}

            {!isProcessing && !result && (
              <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button onClick={reset} className="btn-ghost" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '12px 24px', borderRadius: 99 }}>
                  <IconRefresh size={18} /> ถ่ายใหม่
                </button>
                <button onClick={processImage} className="btn-primary" style={{ padding: '12px 32px', borderRadius: 99 }}>
                  <IconSparkles size={18} /> เริ่มสแกน
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Result Display */}
      {result && (
        <div className="animate-in" style={{ marginTop: 32 }}>
          <div style={{ 
            background: 'var(--surface-card)', 
            borderRadius: 24, 
            padding: 24, 
            border: '1px solid var(--border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <IconFileText size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <span className="pill pill-neutral" style={{ fontSize: 10, marginBottom: 4 }}>{result.subject || 'สแกน'}</span>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{result.title}</h2>
              </div>
            </div>
            
            <div 
              style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', maxHeight: 300, overflowY: 'auto', marginBottom: 24, padding: '0 4px' }}
              dangerouslySetInnerHTML={{ __html: result.body }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={reset} className="btn-ghost" style={{ flex: 1, borderRadius: 16 }}>
                ยกเลิก
              </button>
              <button 
                onClick={saveToNotes} 
                className="btn-primary" 
                style={{ flex: 2, borderRadius: 16, gap: 8 }}
                disabled={isSaving}
              >
                {isSaving ? <IconLoader2 size={18} className="animate-spin" /> : <IconCheck size={18} />}
                บันทึกเป็นโน้ต
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scanMove {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
