'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

// SHA-256 hash using Web Crypto API (works client-side, no server needed)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_studyos_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const AUTO_LOCK_MS = 5 * 60 * 1000; // 5 minutes default
const SESSION_KEY = 'studyos_session_unlocked';

export function usePin() {
  const { user, isLocalMode, loading: authLoading } = useAuth();
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load PIN status
  useEffect(() => {
    if (authLoading) return;

    const check = async () => {
      try {
        let pinExists = false;
        if (isLocalMode) {
          pinExists = !!localStorage.getItem('studyos_pin_hash');
        } else if (user) {
          const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
          const snap = await getDoc(profileRef);
          if (snap.exists() && snap.data().pinHash) {
            pinExists = true;
          }
        }
        setHasPin(pinExists);

        // Check if there's an active session (user just unlocked)
        if (pinExists) {
          const session = sessionStorage.getItem(SESSION_KEY);
          if (session === 'true') {
            setIsLocked(false);
          } else {
            setIsLocked(true);
          }
        } else {
          setIsLocked(false);
        }
      } catch (error) {
        console.error('Error checking PIN:', error);
        setIsLocked(false);
        setHasPin(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user, isLocalMode, authLoading]);

  // Auto-lock timer
  useEffect(() => {
    if (!hasPin) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    timerRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > AUTO_LOCK_MS) {
        setIsLocked(true);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasPin]);

  const setPin = useCallback(async (pin: string) => {
    try {
      const hashed = await hashPin(pin);
      if (isLocalMode) {
        localStorage.setItem('studyos_pin_hash', hashed);
      } else if (user) {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
        await setDoc(profileRef, { pinHash: hashed }, { merge: true });
      }
      setHasPin(true);
      setIsLocked(false);
      sessionStorage.setItem(SESSION_KEY, 'true');
      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Error setting PIN:', error);
    }
  }, [user, isLocalMode]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const hashed = await hashPin(pin);
      let storedHash = '';

      if (isLocalMode) {
        storedHash = localStorage.getItem('studyos_pin_hash') || '';
      } else if (user) {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          storedHash = snap.data().pinHash || '';
        }
      }

      if (hashed === storedHash) {
        setIsLocked(false);
        sessionStorage.setItem(SESSION_KEY, 'true');
        lastActivityRef.current = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }, [user, isLocalMode]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
    lastActivityRef.current = Date.now();
  }, []);

  const clearPin = useCallback(async () => {
    try {
      if (isLocalMode) {
        localStorage.removeItem('studyos_pin_hash');
      } else if (user) {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
        await setDoc(profileRef, { pinHash: null }, { merge: true });
      }
      setHasPin(false);
      setIsLocked(false);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (error) {
      console.error('Error clearing PIN:', error);
    }
  }, [user, isLocalMode]);

  return { hasPin, isLocked, setPin, verifyPin, unlock, clearPin, loading: loading || authLoading };
}
