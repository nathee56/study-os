'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, limit, Timestamp,
} from 'firebase/firestore';

export interface AIMemoryItem {
  id: string;
  key: string;       // e.g. "weak_subject", "study_habit", "preference"
  value: string;      // e.g. "เรียนอ่อนเรื่อง Calculus"
  source: 'extracted' | 'manual';
  createdAt: Date;
}

const MAX_MEMORIES = 50;

export function useAIMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<AIMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setMemories([]); setLoading(false); return; }

    const q = query(
      collection(db, 'users', user.uid, 'ai_memory'),
      orderBy('createdAt', 'desc'),
      limit(MAX_MEMORIES)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: AIMemoryItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          key: data.key || '',
          value: data.value || '',
          source: data.source || 'extracted',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setMemories(items);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Direct add memory (for event handler, avoids stale closure)
  const addMemoryDirect = async (key: string, value: string) => {
    if (!user) return;
    const exists = memories.some(m => m.value.toLowerCase() === value.toLowerCase());
    if (exists) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'ai_memory'), {
        key, value, source: 'extracted', createdAt: Timestamp.now(),
      });
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  };

  // Listen for memory extraction events from useChat
  useEffect(() => {
    const handleExtracted = async (e: Event) => {
      const items = (e as CustomEvent).detail as { key: string; value: string }[];
      if (items && items.length > 0 && user) {
        for (const item of items) {
          try {
            await addDoc(collection(db, 'users', user.uid, 'ai_memory'), {
              key: item.key, value: item.value, source: 'extracted', createdAt: Timestamp.now(),
            });
          } catch (e) {
            console.error('Failed to save extracted memory:', e);
          }
        }
      }
    };
    window.addEventListener('ai-memories-extracted', handleExtracted);
    return () => window.removeEventListener('ai-memories-extracted', handleExtracted);
  }, [user]);

  const addMemory = useCallback(async (key: string, value: string, source: 'extracted' | 'manual' = 'extracted') => {
    if (!user) return;
    // Avoid duplicates: check if same value already exists
    const exists = memories.some(m => m.value.toLowerCase() === value.toLowerCase());
    if (exists) return;

    await addDoc(collection(db, 'users', user.uid, 'ai_memory'), {
      key,
      value,
      source,
      createdAt: Timestamp.now(),
    });

    // If over limit, remove oldest (FIFO)
    if (memories.length >= MAX_MEMORIES) {
      const oldest = memories[memories.length - 1];
      if (oldest) {
        await deleteDoc(doc(db, 'users', user.uid, 'ai_memory', oldest.id));
      }
    }
  }, [user, memories]);

  const addMemories = useCallback(async (items: { key: string; value: string }[]) => {
    for (const item of items) {
      await addMemory(item.key, item.value);
    }
  }, [addMemory]);

  const deleteMemory = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'ai_memory', id));
  }, [user]);

  const clearAllMemories = useCallback(async () => {
    if (!user) return;
    for (const m of memories) {
      await deleteDoc(doc(db, 'users', user.uid, 'ai_memory', m.id));
    }
  }, [user, memories]);

  // Build memory string for system prompt
  const getMemoryPrompt = useCallback(() => {
    if (memories.length === 0) return '';
    const lines = memories.map(m => `- ${m.value}`).join('\n');
    return `\nคุณจำได้ว่าผู้ใช้:\n${lines}`;
  }, [memories]);

  return { memories, loading, addMemory, addMemories, deleteMemory, clearAllMemories, getMemoryPrompt };
}
