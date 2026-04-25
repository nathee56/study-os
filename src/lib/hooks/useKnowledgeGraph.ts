'use client';

import { useMemo } from 'react';
import { Note } from './useNotes';
import { ScheduleItem } from './useSchedule';
import { Todo } from './useTodos';
import { WorkspaceFile } from './useWorkspace';

export interface GraphNode {
  id: string;
  label: string;
  type: 'note' | 'schedule' | 'todo' | 'file' | 'subject';
  color: string;
  size: number;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const NODE_COLORS: Record<GraphNode['type'], string> = {
  note: '#4285F4',
  schedule: '#34A853',
  todo: '#EA4335',
  file: '#FBBC04',
  subject: '#E8651A',
};

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '').split(/\s+/);
  return words.filter(w => w.length > 2);
}

function findCommonKeywords(a: string[], b: string[]): string[] {
  return a.filter(w => b.includes(w));
}

export function useKnowledgeGraph(
  notes: Note[],
  schedule: ScheduleItem[],
  todos: Todo[],
  files: WorkspaceFile[]
): KnowledgeGraph {
  return useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const subjects = new Set<string>();

    // Collect subjects
    schedule.forEach(s => { if (s.name) subjects.add(s.name); });
    todos.forEach(t => { if (t.subject) subjects.add(t.subject); });
    notes.forEach(n => { if (n.subject) subjects.add(n.subject); });

    // Subject nodes
    subjects.forEach(sub => {
      nodes.push({
        id: `subject-${sub}`,
        label: sub,
        type: 'subject',
        color: NODE_COLORS.subject,
        size: 8,
      });
    });

    // Note nodes
    notes.forEach(note => {
      const nodeId = `note-${note.id}`;
      nodes.push({
        id: nodeId,
        label: note.title,
        type: 'note',
        color: NODE_COLORS.note,
        size: 5,
        data: { body: note.body, updatedAt: note.updatedAt },
      });
      if (note.subject && subjects.has(note.subject)) {
        edges.push({ source: nodeId, target: `subject-${note.subject}`, strength: 1, label: 'วิชา' });
      }
    });

    // Schedule nodes
    schedule.forEach(cls => {
      const nodeId = `schedule-${cls.id}`;
      nodes.push({
        id: nodeId,
        label: `${cls.name} (${cls.day})`,
        type: 'schedule',
        color: NODE_COLORS.schedule,
        size: 4,
        data: { startTime: cls.startTime, endTime: cls.endTime, room: cls.room },
      });
      if (subjects.has(cls.name)) {
        edges.push({ source: nodeId, target: `subject-${cls.name}`, strength: 1, label: 'ตารางเรียน' });
      }
    });

    // Todo nodes
    todos.forEach(todo => {
      const nodeId = `todo-${todo.id}`;
      nodes.push({
        id: nodeId,
        label: todo.title,
        type: 'todo',
        color: NODE_COLORS.todo,
        size: todo.priority === 'urgent' ? 6 : 4,
        data: { done: todo.done, dueDate: todo.dueDate, priority: todo.priority },
      });
      if (todo.subject && subjects.has(todo.subject)) {
        edges.push({ source: nodeId, target: `subject-${todo.subject}`, strength: 1, label: 'งาน' });
      }
    });

    // File nodes
    files.slice(0, 20).forEach(file => {
      if (file.mimeType === 'application/vnd.google-apps.folder') return;
      const nodeId = `file-${file.id}`;
      nodes.push({
        id: nodeId,
        label: file.name,
        type: 'file',
        color: NODE_COLORS.file,
        size: 4,
        data: { mimeType: file.mimeType, webViewLink: file.webViewLink },
      });

      // Try to connect files to subjects by name matching
      subjects.forEach(sub => {
        const subWords = extractKeywords(sub);
        const fileWords = extractKeywords(file.name);
        const common = findCommonKeywords(subWords, fileWords);
        if (common.length > 0) {
          edges.push({ source: nodeId, target: `subject-${sub}`, strength: common.length / subWords.length, label: 'เกี่ยวข้อง' });
        }
      });
    });

    // Cross-connect notes to todos by keyword matching
    notes.forEach(note => {
      const noteKeywords = extractKeywords(note.title + ' ' + note.body.slice(0, 200));
      todos.forEach(todo => {
        const todoKeywords = extractKeywords(todo.title);
        const common = findCommonKeywords(noteKeywords, todoKeywords);
        if (common.length >= 2) {
          edges.push({
            source: `note-${note.id}`,
            target: `todo-${todo.id}`,
            strength: Math.min(common.length / 5, 1),
            label: 'เนื้อหาเกี่ยวข้อง',
          });
        }
      });
    });

    return { nodes, edges };
  }, [notes, schedule, todos, files]);
}
