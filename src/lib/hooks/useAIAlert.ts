'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AIAlert {
  type: 'deadline' | 'class' | 'reminder' | 'insight';
  message: string;
  details: string;
  urgency: 'high' | 'medium' | 'low';
}

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'jamdai_ai_alerts';
const CACHE_TIME_KEY = 'jamdai_ai_alerts_time';

export function useAIAlert(context: {
  userId: string;
  todos: string;
  schedule: string;
  memories: string;
  enabled: boolean;
}) {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const USER_CACHE_KEY = `${CACHE_KEY}_${context.userId}`;
  const USER_CACHE_TIME_KEY = `${CACHE_TIME_KEY}_${context.userId}`;

  const lastFetchedTodos = useRef('');

  useEffect(() => {
    if (!context.enabled || !context.userId) {
      if (!context.enabled) setAlerts([]);
      return;
    }

    // Skip if todos haven't changed meaningfully since last fetch
    if (context.todos === lastFetchedTodos.current) return;

    // Check cache first
    const cachedTime = sessionStorage.getItem(USER_CACHE_TIME_KEY);
    const cachedAlerts = sessionStorage.getItem(USER_CACHE_KEY);

    if (cachedTime && cachedAlerts) {
      const elapsed = Date.now() - parseInt(cachedTime);
      if (elapsed < COOLDOWN_MS) {
        try {
          setAlerts(JSON.parse(cachedAlerts));
          lastFetchedTodos.current = context.todos;
        } catch { /* ignore */ }
        return;
      }
    }

    // Fetch new alerts
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const currentTime = now.toLocaleDateString('th-TH', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });

        const res = await fetch('/api/ai/proactive-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todos: context.todos,
            schedule: context.schedule,
            memories: context.memories,
            currentTime,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const newAlerts = data.alerts || [];
          setAlerts(newAlerts);
          lastFetchedTodos.current = context.todos;

          // Cache results
          sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(newAlerts));
          sessionStorage.setItem(USER_CACHE_TIME_KEY, Date.now().toString());
        }
      } catch (e) {
        console.error('Failed to fetch AI alerts:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [context.enabled, context.userId, context.todos]); 

  const dismissAlert = useCallback((index: number) => {
    setDismissed(prev => new Set(prev).add(alerts[index]?.message));
  }, [alerts]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.message));

  return { alerts: visibleAlerts, loading, dismissAlert };
}
