import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountStr) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('Failed to parse Firebase Service Account Key JSON', error);
      throw error;
    }
  }

  return {
    dbAdmin: getFirestore(),
  };
}
