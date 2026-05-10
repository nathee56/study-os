'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

export function useOnboarding() {
  const { user, isLocalMode, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const check = async () => {
      try {
        if (isLocalMode) {
          // Local Mode: check localStorage
          const done = localStorage.getItem('studyos_onboarding');
          setNeedsOnboarding(done !== 'done');
        } else if (user) {
          // Google Mode: check Firestore
          const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setNeedsOnboarding(snap.data().onboardingDone !== true);
          } else {
            setNeedsOnboarding(true);
          }
        } else {
          // Not logged in
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user, isLocalMode, authLoading]);

  const completeOnboarding = useCallback(async () => {
    try {
      if (isLocalMode) {
        localStorage.setItem('studyos_onboarding', 'done');
      } else if (user) {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'settings');
        await setDoc(profileRef, { onboardingDone: true }, { merge: true });
      }
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [user, isLocalMode]);

  return { needsOnboarding, completeOnboarding, loading: loading || authLoading };
}
