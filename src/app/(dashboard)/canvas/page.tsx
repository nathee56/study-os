'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvas, CanvasItem } from '@/lib/hooks/useCanvas';
import { useNotes } from '@/lib/hooks/useNotes';
import { callLLM } from '@/lib/thaillm';
import { IconPlus, IconTrash, IconSparkle, IconFileText, IconX, IconShare2 } from '@/components/ui/Icons';

const STICKY_COLORS = ['#FFF3C4', '#D5E5F5', '#D9F0DA', '#F5DBE5', '#FCE8D5', '#E5DDF5'];

export default function CanvasPage() {
  const { items, lines, selectedId, pan, zoom, isLoaded, setSelectedId, setPan, setZoom, addItem, updateItem, deleteItem, moveItem, toggleLine, clearCanvas } = useCanvas();
  const { notes } = useNotes();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedId(null);
      setConnectSource(null);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const coords = toCanvasCoords(e.clientX, e.clientY);
    setMousePos(coords);
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (dragId) {
      moveItem(dragId, coords.x - dragOffset.x, coords.y - dragOffset.y);
    }
  }, [isPanning, panStart, dragId, dragOffset, toCanvasCoords, moveItem, setPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragId(null);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.3), 3));
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    if (isConnectMode) {
      if (!connectSource) {
        setConnectSource(item.id);
      } else {
        toggleLine(connectSource, item.id);
        setConnectSource(null);
      }
      return;
    }
    setSelectedId(item.id);
    const coords = toCanvasCoords(e.clientX, e.clientY);
    setDragOffset({ x: coords.x - item.x, y: coords.y - item.y });
    setDragId(item.id);
    setIsDragging(true);
  };

  const handleAddSticky = () => {
    const color = STICKY_COLORS[colorIndex % STICKY_COLORS.length];
    setColorIndex(prev => prev + 1);
    const centerX = (-pan.x + (canvasRef.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-pan.y + (canvasRef.current?.clientHeight || 500) / 2) / zoom;
    addItem('sticky', centerX - 100 + Math.random() * 50, centerY - 75 + Math.random() * 50, '', color);
  };

  const handleAddText = () => {
    const centerX = (-pan.x + (canvasRef.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-pan.y + (canvasRef.current?.clientHeight || 500) / 2) / zoom;
    addItem('text', centerX - 150, centerY, 'ข้อความใหม่', '#FFFFFF');
  };

  const handleImportNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const centerX = (-pan.x + (canvasRef.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-pan.y + (canvasRef.current?.clientHeight || 500) / 2) / zoom;
    addItem('sticky', centerX - 100 + Math.random() * 100, centerY - 75 + Math.random() * 100,
      `📝 ${note.title}\n${note.body.replace(/<[^>]+>/g, '').slice(0, 200)}`, '#D5E5F5');
    setShowNotes(false);
  };

  const handleGenerateMindMap = async () => {
    const stickies = items.filter(i => i.type === 'sticky' && i.content.trim());
    if (stickies.length === 0) return;

    setIsGeneratingMindMap(true);
    try {
      const content = stickies.map(s => s.content).join('\n---\n');
      const res = await callLLM('openthaigpt-thaillm-8b-instruct-v7.2', [
        { role: 'system', content: 'สร้าง Mind Map จากข้อมูลที่ให้มา ตอบเป็นรายการหัวข้อหลักและหัวข้อย่อย ใช้รูปแบบ:\nหัวข้อหลัก1\n- หัวข้อย่อย1.1\n- หัวข้อย่อย1.2\nหัวข้อหลัก2\n- หัวข้อย่อย2.1' },
        { role: 'user', content: `สร้าง Mind Map จากข้อมูลนี้:\n${content}` },
      ]);

      const lines = res.choices[0].message.content.split('\n').filter((l: string) => l.trim());
      let mainX = (-pan.x + 400) / zoom;
      let mainY = (-pan.y + 200) / zoom;

      lines.forEach((line: string, i: number) => {
        const isSubtopic = line.startsWith('-') || line.startsWith('•');
        const text = line.replace(/^[-•]\s*/, '').trim();
        if (!text) return;

        if (isSubtopic) {
          addItem('sticky', mainX + 220, mainY + (i * 40) - 20, text, '#E5DDF5');
        } else {
          mainY = (-pan.y + 200 + i * 80) / zoom;
          addItem('sticky', mainX, mainY, `🧠 ${text}`, '#FCE8D5');
        }
      });
    } catch {
      // Silent fail
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 120px)', overflow: 'hidden', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-strong)' }}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas-bg"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
          background: 'var(--bg)',
          backgroundImage: `radial-gradient(circle, var(--border-strong) 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          <svg 
            viewBox="-5000 -5000 10000 10000"
            style={{ position: 'absolute', top: -5000, left: -5000, width: 10000, height: 10000, pointerEvents: 'none', zIndex: 0 }}
          >
            {lines.map(line => {
              const src = items.find(i => i.id === line.sourceId);
              const tgt = items.find(i => i.id === line.targetId);
              if (!src || !tgt) return null;
              const srcX = src.x + (src.width || 200) / 2;
              const srcY = src.y + (src.height || 150) / 2;
              const tgtX = tgt.x + (tgt.width || 200) / 2;
              const tgtY = tgt.y + (tgt.height || 150) / 2;
              return (
                <line
                  key={line.id}
                  x1={srcX} y1={srcY} x2={tgtX} y2={tgtY}
                  stroke="#886FBF"
                  strokeWidth={2}
                />
              );
            })}
            {isConnectMode && connectSource && (() => {
              const src = items.find(i => i.id === connectSource);
              if (!src) return null;
              const srcX = src.x + (src.width || 200) / 2;
              const srcY = src.y + (src.height || 150) / 2;
              return (
                <line
                  x1={srcX} y1={srcY} x2={mousePos.x} y2={mousePos.y}
                  stroke="var(--orange)"
                  strokeWidth={4}
                  strokeDasharray="8 8"
                />
              );
            })()}
          </svg>
          {items.map(item => (
            <div
              key={item.id}
              onMouseDown={(e) => handleItemMouseDown(e, item)}
              onDoubleClick={() => setEditingId(item.id)}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: item.width || 'auto',
                minHeight: item.type === 'sticky' ? item.height : 'auto',
                background: item.color,
                borderRadius: item.type === 'sticky' ? 4 : 8,
                padding: item.type === 'sticky' ? 12 : 8,
                boxShadow: (selectedId === item.id || connectSource === item.id) ? '0 0 0 2px var(--orange), 0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                cursor: isConnectMode ? 'crosshair' : isDragging && dragId === item.id ? 'grabbing' : 'grab',
                fontSize: item.type === 'sticky' ? 13 : 16,
                fontWeight: item.type === 'text' ? 600 : 400,
                lineHeight: 1.5,
                userSelect: 'none',
                zIndex: selectedId === item.id ? 10 : 1,
                transition: dragId === item.id ? 'none' : 'box-shadow 0.2s',
                color: '#1A1816',
              }}
            >
              {editingId === item.id ? (
                <textarea
                  autoFocus
                  value={item.content}
                  onChange={(e) => updateItem(item.id, { content: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }}
                  style={{
                    width: '100%', height: '100%', minHeight: 80, border: 'none', background: 'transparent',
                    fontSize: 'inherit', fontFamily: 'inherit', resize: 'none', outline: 'none',
                    color: 'inherit', lineHeight: 'inherit',
                  }}
                />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {item.content || (item.type === 'sticky' ? 'ดับเบิลคลิกเพื่อพิมพ์...' : 'ข้อความ')}
                </div>
              )}
              {selectedId === item.id && (
                <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 20, height: 20, borderRadius: '50%', border: 'none',
                    background: 'var(--danger)', color: '#fff', fontSize: 10,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="canvas-toolbar">
        <button onClick={handleAddSticky} title="เพิ่ม Sticky Note">
          <IconPlus size={18} />
        </button>
        <button onClick={handleAddText} title="เพิ่มข้อความ" style={{ fontSize: 14, fontWeight: 700 }}>
          T
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />
        <button onClick={() => setShowNotes(!showNotes)} title="นำเข้าจากโน้ต" className={showNotes ? 'active' : ''}>
          <IconFileText size={18} />
        </button>
        <button onClick={() => {
          setIsConnectMode(!isConnectMode);
          setConnectSource(null);
          setSelectedId(null);
        }} title="เชื่อมต่อ" className={isConnectMode ? 'active' : ''}>
          <IconShare2 size={18} />
        </button>
        <button onClick={handleGenerateMindMap} title="AI สร้าง Mind Map"
          disabled={isGeneratingMindMap || items.filter(i => i.content.trim()).length === 0}
          className={isGeneratingMindMap ? 'active' : ''}>
          <IconSparkle size={18} />
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />
        <button onClick={clearCanvas} title="ล้าง Canvas">
          <IconTrash size={18} />
        </button>
        <div style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-hint)', minWidth: 40, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Notes drawer */}
      {showNotes && (
        <div style={{
          position: 'absolute', right: 16, top: 16, width: 260,
          background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 14, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: '60%', overflowY: 'auto', zIndex: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>นำเข้าจากโน้ต</span>
            <button className="btn-icon" onClick={() => setShowNotes(false)} style={{ padding: 4 }}>
              <IconX size={14} />
            </button>
          </div>
          {notes.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-hint)', textAlign: 'center', padding: 20 }}>ยังไม่มีโน้ต</p>
          ) : (
            notes.map(n => (
              <button key={n.id} className="nav-item" onClick={() => handleImportNote(n.id)}
                style={{ width: '100%', margin: '2px 0', padding: '8px 10px', fontSize: 12 }}>
                <IconFileText size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Generating indicator */}
      {isGeneratingMindMap && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--orange-light)',
          borderRadius: 12, padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div className="typing-indicator">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
          AI กำลังสร้าง Mind Map...
        </div>
      )}
    </div>
  );
}
