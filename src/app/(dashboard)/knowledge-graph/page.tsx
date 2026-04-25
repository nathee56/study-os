'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useTodos } from '@/lib/hooks/useTodos';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { useKnowledgeGraph, GraphNode } from '@/lib/hooks/useKnowledgeGraph';
import { IconSearch, IconBrain } from '@/components/ui/Icons';

const KnowledgeGraph3D = dynamic(() => import('@/components/graph/KnowledgeGraph3D'), { ssr: false });

const NODE_TYPE_LABELS: Record<GraphNode['type'], string> = {
  note: 'โน้ต',
  schedule: 'ตารางเรียน',
  todo: 'งาน',
  file: 'ไฟล์',
  subject: 'วิชา',
};

const NODE_COLORS: Record<GraphNode['type'], string> = {
  note: '#4285F4',
  schedule: '#34A853',
  todo: '#EA4335',
  file: '#FBBC04',
  subject: '#E8651A',
};

export default function KnowledgeGraphPage() {
  const { notes } = useNotes();
  const { schedule } = useSchedule();
  const { todos } = useTodos();
  const { files } = useWorkspace();
  const graph = useKnowledgeGraph(notes, schedule, todos, files);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTypes, setFilterTypes] = useState<Set<GraphNode['type']>>(new Set(['note', 'schedule', 'todo', 'file', 'subject']));

  const filteredGraph = useMemo(() => {
    let nodes = graph.nodes.filter(n => filterTypes.has(n.type));
    if (search) {
      nodes = nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()));
    }
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = graph.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes, edges };
  }, [graph, filterTypes, search]);

  const selectedNode = graph.nodes.find(n => n.id === selectedId);

  const connectedNodes = useMemo(() => {
    if (!selectedId) return [];
    return graph.edges
      .filter(e => e.source === selectedId || e.target === selectedId)
      .map(e => {
        const otherId = e.source === selectedId ? e.target : e.source;
        return graph.nodes.find(n => n.id === otherId);
      })
      .filter(Boolean);
  }, [selectedId, graph]);

  const toggleFilter = (type: GraphNode['type']) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const isEmpty = graph.nodes.length === 0;

  return (
    <div className="animate-in" style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Left Panel */}
      <div className="card" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input className="input" placeholder="ค้นหาโหนด..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 12 }} />
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>ประเภทโหนด</div>
        {(Object.keys(NODE_TYPE_LABELS) as GraphNode['type'][]).map(type => (
          <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={filterTypes.has(type)}
              onChange={() => toggleFilter(type)}
              style={{ accentColor: NODE_COLORS[type] }} />
            <span className="graph-legend-dot" style={{ background: NODE_COLORS[type] }} />
            {NODE_TYPE_LABELS[type]}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-hint)' }}>
              {graph.nodes.filter(n => n.type === type).length}
            </span>
          </label>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
        <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>
          {filteredGraph.nodes.length} โหนด · {filteredGraph.edges.length} เส้นเชื่อม
        </div>
      </div>

      {/* 3D Graph */}
      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: '#0a0a0f', border: '1px solid var(--border-strong)' }}>
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
            <IconBrain size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 15 }}>เพิ่มโน้ต ตารางเรียน หรืองาน เพื่อสร้างเครือข่ายความรู้</p>
          </div>
        ) : (
          <KnowledgeGraph3D
            nodes={filteredGraph.nodes}
            edges={filteredGraph.edges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
        <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '8px 14px', fontSize: 11, color: '#aaa' }}>
          🖱 ลาก: หมุน · Scroll: ซูม · คลิกโหนด: ดูรายละเอียด
        </div>
      </div>

      {/* Right Panel - Detail */}
      {selectedNode && (
        <div className="card" style={{ width: 260, flexShrink: 0, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="graph-legend-dot" style={{ background: selectedNode.color, width: 14, height: 14 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedNode.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{NODE_TYPE_LABELS[selectedNode.type]}</div>
            </div>
          </div>

          {selectedNode.data && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {selectedNode.type === 'note' && (
                <p style={{ lineHeight: 1.6 }}>{(selectedNode.data.body as string || '').slice(0, 200)}...</p>
              )}
              {selectedNode.type === 'schedule' && (
                <>
                  <p>⏰ {selectedNode.data.startTime as string} - {selectedNode.data.endTime as string}</p>
                  <p>📍 {selectedNode.data.room as string}</p>
                </>
              )}
              {selectedNode.type === 'todo' && (
                <>
                  <p>สถานะ: {(selectedNode.data.done as boolean) ? '✅ เสร็จแล้ว' : '⏳ ยังไม่เสร็จ'}</p>
                  <p>ความสำคัญ: {selectedNode.data.priority as string}</p>
                </>
              )}
            </div>
          )}

          {connectedNodes.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>เชื่อมโยงกับ ({connectedNodes.length})</div>
              {connectedNodes.map((node) => node && (
                <button key={node.id} className="nav-item" onClick={() => setSelectedId(node.id)}
                  style={{ width: '100%', margin: '2px 0', padding: '6px 10px', fontSize: 12 }}>
                  <span className="graph-legend-dot" style={{ background: node.color }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</span>
                </button>
              ))}
            </>
          )}

          <button className="btn-ghost" onClick={() => setSelectedId(null)}
            style={{ width: '100%', marginTop: 12, fontSize: 12 }}>
            ปิด
          </button>
        </div>
      )}
    </div>
  );
}
