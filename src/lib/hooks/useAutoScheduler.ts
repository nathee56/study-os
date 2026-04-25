'use client';

import { useCallback, useState } from 'react';
import { Todo } from './useTodos';
import { ScheduleItem } from './useSchedule';

export interface TimeBlock {
  id: string;
  todoId: string;
  todoTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  isAISuggested: boolean;
}

interface TimeSlot {
  day: string;
  start: number; // minutes from midnight
  end: number;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_LABELS: Record<string, string> = {
  mon: 'จันทร์', tue: 'อังคาร', wed: 'พุธ', thu: 'พฤหัสบดี', fri: 'ศุกร์',
  sat: 'เสาร์', sun: 'อาทิตย์',
};

export { DAY_LABELS };

export function useAutoScheduler() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  const findFreeSlots = useCallback((schedule: ScheduleItem[], studyStart = 8 * 60, studyEnd = 20 * 60): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    DAYS.forEach(day => {
      const classes = schedule
        .filter(s => s.day === day)
        .map(s => ({ start: timeToMinutes(s.startTime), end: timeToMinutes(s.endTime) }))
        .sort((a, b) => a.start - b.start);

      let cursor = studyStart;
      classes.forEach(cls => {
        if (cursor < cls.start) {
          const gap = cls.start - cursor;
          if (gap >= 30) { // minimum 30 min slot
            slots.push({ day, start: cursor, end: cls.start });
          }
        }
        cursor = Math.max(cursor, cls.end);
      });

      if (cursor < studyEnd) {
        slots.push({ day, start: cursor, end: studyEnd });
      }
    });

    return slots;
  }, []);

  const autoSchedule = useCallback((todos: Todo[], schedule: ScheduleItem[]) => {
    setIsScheduling(true);

    const pending = todos
      .filter(t => !t.done)
      .sort((a, b) => {
        // Priority: urgent first, then by due date, then by difficulty
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        const dateA = a.dueDate?.getTime() || Infinity;
        const dateB = b.dueDate?.getTime() || Infinity;
        if (dateA !== dateB) return dateA - dateB;
        return (b.difficulty || 3) - (a.difficulty || 3);
      });

    const freeSlots = findFreeSlots(schedule);
    const blocks: TimeBlock[] = [];
    let slotIndex = 0;

    pending.forEach(todo => {
      if (slotIndex >= freeSlots.length) return;

      const estimatedMinutes = Math.max(30, (todo.difficulty || 3) * 20);
      const slot = freeSlots[slotIndex];
      const available = slot.end - slot.start;

      if (available >= estimatedMinutes) {
        blocks.push({
          id: `block-${todo.id}`,
          todoId: todo.id,
          todoTitle: todo.title,
          day: slot.day,
          startTime: minutesToTime(slot.start),
          endTime: minutesToTime(slot.start + estimatedMinutes),
          duration: estimatedMinutes,
          isAISuggested: true,
        });

        // Shrink the slot
        freeSlots[slotIndex] = { ...slot, start: slot.start + estimatedMinutes + 10 }; // 10min break
        if (freeSlots[slotIndex].end - freeSlots[slotIndex].start < 30) {
          slotIndex++;
        }
      } else {
        slotIndex++;
      }
    });

    setTimeBlocks(blocks);
    setIsScheduling(false);
    return blocks;
  }, [findFreeSlots]);

  const removeBlock = useCallback((blockId: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  const clearBlocks = useCallback(() => {
    setTimeBlocks([]);
  }, []);

  return {
    timeBlocks,
    isScheduling,
    autoSchedule,
    removeBlock,
    clearBlocks,
    DAY_LABELS,
  };
}
