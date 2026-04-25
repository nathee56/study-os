'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';

export interface Note {
  id: string;
  title: string;
  body: string;
  subject: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) { setNotes([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'notes'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, title: data.title || '', body: data.body || '',
          subject: data.subject || '', color: data.color || '#FFFFFF',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addNote = useCallback(async (note: Partial<Note>) => {
    if (!user) return '';
    const ref = await addDoc(collection(db, 'users', user.uid, 'notes'), {
      title: note.title || 'โน้ตใหม่',
      body: note.body || '',
      subject: note.subject || '',
      color: note.color || '#FFFFFF',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }, [user]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    const d: Record<string, unknown> = { ...updates, updatedAt: Timestamp.now() };
    delete d.id; delete d.createdAt;
    if (d.updatedAt === undefined) d.updatedAt = Timestamp.now();
    await updateDoc(doc(db, 'users', user.uid, 'notes', id), d);
  }, [user]);

  const autoSave = useCallback((id: string, updates: Partial<Note>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { updateNote(id, updates); }, 3000);
  }, [updateNote]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
  }, [user]);

  return { notes, loading, addNote, updateNote, autoSave, deleteNote };
}
