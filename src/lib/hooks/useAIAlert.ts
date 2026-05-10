'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AIAlert {
  type: 'deadline' | 'class' | 'reminder';
  message: string;
  urgency: 'high' | 'medium' | 'low';
}

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'jamdai_ai_alerts';
const CACHE_TIME_KEY = 'jamdai_ai_alerts_time';

export function useAIAlert(context: {
  todos: string;
  schedule: string;
  memories: string;
  enabled: boolean;
}) {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!context.enabled) return;

    // Check cache first
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
    const cachedAlerts = sessionStorage.getItem(CACHE_KEY);

    if (cachedTime && cachedAlerts) {
      const elapsed = Date.now() - parseInt(cachedTime);
      if (elapsed < COOLDOWN_MS) {
        try {
          setAlerts(JSON.parse(cachedAlerts));
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

          // Cache results
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(newAlerts));
          sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }
      } catch (e) {
        console.error('Failed to fetch AI alerts:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [context.enabled]); // Only re-fetch when enabled changes (page load)

  const dismissAlert = useCallback((index: number) => {
    setDismissed(prev => new Set(prev).add(alerts[index]?.message));
  }, [alerts]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.message));

  return { alerts: visibleAlerts, loading, dismissAlert };
}
