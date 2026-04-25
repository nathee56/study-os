'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
} from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a token stored from a previous session
    const storedToken = localStorage.getItem('googleAccessToken');
    if (storedToken) {
      setGoogleAccessToken(storedToken);
    }
    
    // Check local mode
    const localMode = localStorage.getItem('studyos_local_mode');
    if (localMode === 'true') {
      setIsLocalMode(true);
      setLoading(false); // We don't need to wait for Firebase if local mode
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Only finish loading if we haven't already loaded via local mode
      if (!localMode) {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        localStorage.setItem('googleAccessToken', credential.accessToken);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, []);

  const loginLocalMode = useCallback(() => {
    localStorage.setItem('studyos_local_mode', 'true');
    setIsLocalMode(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setGoogleAccessToken(null);
      localStorage.removeItem('googleAccessToken');
      localStorage.removeItem('studyos_local_mode');
      setIsLocalMode(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return { user, isLocalMode, loading, signIn, loginLocalMode, signOut, googleAccessToken };
}
