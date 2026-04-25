'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';

export interface ScheduleItem {
  id: string;
  code: string;
  name: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  color: string;
  semester: string;
}

const CLASS_COLORS = ['#E8D5C4', '#C4D5E8', '#D5E8C4', '#E8C4D5', '#D5C4E8'];

export function useSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setSchedule([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'schedule'), orderBy('day'));
    const unsub = onSnapshot(q, (snap) => {
      setSchedule(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ScheduleItem, 'id'>) })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addClass = useCallback(async (item: Omit<ScheduleItem, 'id'>) => {
    if (!user) return;
    const ci = schedule.length % CLASS_COLORS.length;
    await addDoc(collection(db, 'users', user.uid, 'schedule'), { ...item, color: item.color || CLASS_COLORS[ci] });
  }, [user, schedule.length]);

  const updateClass = useCallback(async (id: string, updates: Partial<ScheduleItem>) => {
    if (!user) return;
    const d = { ...updates }; delete (d as Record<string, unknown>).id;
    await updateDoc(doc(db, 'users', user.uid, 'schedule', id), d);
  }, [user]);

  const deleteClass = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'schedule', id));
  }, [user]);

  const normalizeDay = (dayStr: string): ScheduleItem['day'] => {
    if (!dayStr) return 'mon';
    const s = dayStr.toLowerCase().trim();
    if (s.includes('mon') || s.includes('จันทร์') || s === 'จ.') return 'mon';
    if (s.includes('tue') || s.includes('อังคาร') || s === 'อ.') return 'tue';
    if (s.includes('wed') || s.includes('พุธ') || s === 'พ.') return 'wed';
    if (s.includes('thu') || s.includes('พฤหัส') || s === 'พฤ.') return 'thu';
    if (s.includes('fri') || s.includes('ศุกร์') || s === 'ศ.') return 'fri';
    if (s.includes('sat') || s.includes('เสาร์') || s === 'ส.') return 'sat';
    if (s.includes('sun') || s.includes('อาทิตย์') || s === 'อา.') return 'sun';
    return 'mon';
  };

  const normalizeTime = (timeStr: string) => {
    if (!timeStr) return '08:00';
    const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      const h = match[1].padStart(2, '0');
      const m = match[2];
      return `${h}:${m}`;
    }
    return '08:00';
  };

  const addBulkClasses = useCallback(async (items: Omit<ScheduleItem, 'id'>[]) => {
    if (!user) return;
    for (let i = 0; i < items.length; i++) {
      const ci = (schedule.length + i) % CLASS_COLORS.length;
      const normalizedItem = {
        ...items[i],
        day: normalizeDay(items[i].day as string),
        startTime: normalizeTime(items[i].startTime),
        endTime: normalizeTime(items[i].endTime),
        color: items[i].color || CLASS_COLORS[ci]
      };
      await addDoc(collection(db, 'users', user.uid, 'schedule'), normalizedItem);
    }
  }, [user, schedule.length]);

  const deleteAllClasses = useCallback(async () => {
    if (!user) return;
    for (const item of schedule) {
      await deleteDoc(doc(db, 'users', user.uid, 'schedule', item.id));
    }
  }, [user, schedule]);

  const getTodayClasses = useCallback(() => {
    const dm: Record<number, ScheduleItem['day']> = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
    const today = dm[new Date().getDay()];
    return schedule.filter((s) => s.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule]);

  return { schedule, loading, addClass, updateClass, deleteClass, deleteAllClasses, addBulkClasses, getTodayClasses };
}
