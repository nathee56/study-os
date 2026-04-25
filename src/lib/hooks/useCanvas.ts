'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CanvasItem {
  id: string;
  type: 'sticky' | 'text' | 'connector';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  connectedTo?: string;
}

export interface CanvasLine {
  id: string;
  sourceId: string;
  targetId: string;
}

export function useCanvas() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [lines, setLines] = useState<CanvasLine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('studyos_canvas_items');
      const savedLines = localStorage.getItem('studyos_canvas_lines');
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedLines) setLines(JSON.parse(savedLines));
    } catch (e) {
      console.error('Failed to load canvas state', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('studyos_canvas_items', JSON.stringify(items));
    localStorage.setItem('studyos_canvas_lines', JSON.stringify(lines));
  }, [items, lines, isLoaded]);

  const addItem = useCallback((type: CanvasItem['type'], x: number, y: number, content: string = '', color: string = '#FFF3C4') => {
    const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem: CanvasItem = {
      id, type, x, y,
      width: type === 'sticky' ? 200 : type === 'text' ? 300 : 0,
      height: type === 'sticky' ? 150 : type === 'text' ? 40 : 0,
      content: content || (type === 'sticky' ? '' : ''),
      color,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(id);
    return id;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setLines(prev => prev.filter(line => line.sourceId !== id && line.targetId !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const moveItem = useCallback((id: string, x: number, y: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  }, []);

  const toggleLine = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setLines(prev => {
      const exists = prev.find(l => 
        (l.sourceId === sourceId && l.targetId === targetId) || 
        (l.sourceId === targetId && l.targetId === sourceId)
      );
      if (exists) {
        return prev.filter(l => l.id !== exists.id);
      } else {
        return [...prev, { id: `line-${Date.now()}`, sourceId, targetId }];
      }
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setItems([]);
    setLines([]);
    setSelectedId(null);
  }, []);

  return {
    items, lines, selectedId, pan, zoom, isLoaded,
    setSelectedId, setPan, setZoom,
    addItem, updateItem, deleteItem, moveItem, toggleLine, clearCanvas,
  };
}
