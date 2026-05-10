'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
}

export function useChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) { setChats([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'chats'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: Chat[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, title: data.title || 'แชทใหม่',
          messages: (data.messages || []).map((m: Record<string, unknown>) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content as string,
            timestamp: (m.timestamp as Timestamp)?.toDate() || new Date(),
          })),
          model: data.model || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setChats(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Sync activeChat when chats update
  useEffect(() => {
    if (activeChat) {
      const updated = chats.find((c) => c.id === activeChat.id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(activeChat.messages)) {
        setActiveChat(updated);
      }
    }
  }, [chats, activeChat]);

  const createChat = useCallback(async (model: string) => {
    if (!user) return '';
    const ref = await addDoc(collection(db, 'users', user.uid, 'chats'), {
      title: 'แชทใหม่', messages: [], model, createdAt: Timestamp.now(),
    });
    const newChat: Chat = { id: ref.id, title: 'แชทใหม่', messages: [], model, createdAt: new Date() };
    setActiveChat(newChat);
    return ref.id;
  }, [user]);

  const sendMessage = useCallback(async (
    chatId: string, content: string, model: string,
    systemPrompt: string
  ) => {
    if (!user || sending) return;
    setSending(true);
    try {
      const chat = chats.find((c) => c.id === chatId);
      const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() };
      const currentMessages = chat ? [...chat.messages, userMsg] : [userMsg];

      // Save user message
      await updateDoc(doc(db, 'users', user.uid, 'chats', chatId), {
        messages: currentMessages.map((m) => ({
          ...m, timestamp: Timestamp.fromDate(m.timestamp),
        })),
        title: currentMessages.length <= 1 ? content.slice(0, 40) : (chat?.title || content.slice(0, 40)),
      });

      // Call AI
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.content || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้',
        timestamp: new Date(),
      };

      const allMessages = [...currentMessages, aiMsg];
      await updateDoc(doc(db, 'users', user.uid, 'chats', chatId), {
        messages: allMessages.map((m) => ({
          ...m, timestamp: Timestamp.fromDate(m.timestamp),
        })),
      });

      // Background: extract memories from conversation
      try {
        const extractRes = await fetch('/api/ai/extract-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages.slice(-4).map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (extractRes.ok) {
          const extractData = await extractRes.json();
          if (extractData.memories?.length > 0) {
            // Store extracted memories - dispatch event for useAIMemory to pick up
            window.dispatchEvent(new CustomEvent('ai-memories-extracted', {
              detail: extractData.memories,
            }));
          }
        }
      } catch {
        // Silent fail for memory extraction - it's non-critical
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  }, [user, sending, chats]);

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.uid, 'chats', chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Delete chat error:', error);
    }
  }, [user, activeChat]);

  return { chats, activeChat, setActiveChat, loading, sending, createChat, sendMessage, deleteChat };
}
