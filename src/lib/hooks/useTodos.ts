'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useLocalTodos } from './useLocalTodos';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface Todo {
  id: string;
  title: string;
  subject: string;
  dueDate: Date | null;
  priority: 'urgent' | 'normal';
  difficulty: number; // 1-5
  done: boolean;
  createdAt: Date;
}

export function useTodos() {
  const { user, isLocalMode } = useAuth();
  const localResult = useLocalTodos();
  
  // If local mode, use localStorage — never touch Firestore
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediate clear to prevent flash of old data
    setTodos([]);
    setLoading(true);

    if (isLocalMode || !user) {
      setLoading(false);
      return;
    }
    
    // ... rest of firestore logic ...

    const q = query(
      collection(db, 'users', user.uid, 'todos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Todo[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          subject: data.subject || '',
          dueDate: data.dueDate?.toDate() || null,
          priority: data.priority || 'normal',
          difficulty: data.difficulty || 3,
          done: data.done || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setTodos(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTodo = useCallback(
    async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
      if (!user) return;
      await addDoc(collection(db, 'users', user.uid, 'todos'), {
        ...todo,
        dueDate: todo.dueDate ? Timestamp.fromDate(todo.dueDate) : null,
        createdAt: Timestamp.now(),
      });
    },
    [user]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      if (!user) return;
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      delete updateData.id;
      delete updateData.createdAt;
      await updateDoc(doc(db, 'users', user.uid, 'todos', id), updateData);
    },
    [user]
  );

  const toggleTodo = useCallback(
    async (id: string, done: boolean) => {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid, 'todos', id), { done });
    },
    [user]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
    },
    [user]
  );

  // Local mode: return localStorage results
  if (isLocalMode) return localResult;

  return { todos, loading, addTodo, updateTodo, toggleTodo, deleteTodo };
}
