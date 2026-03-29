import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function initFirebase(config: FirebaseConfig): Auth {
  if (auth) return auth;
  app = initializeApp(config);
  auth = getAuth(app);
  return auth;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initFirebase first.');
  }
  return auth;
}
