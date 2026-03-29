import { writable } from 'svelte/store';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from 'firebase/auth';
import { getFirebaseAuth } from '$lib/firebase';

export const user = writable<User | null>(null);
export const authLoading = writable(true);

let initialized = false;

export function initAuthListener(): void {
  if (initialized) return;
  initialized = true;

  const auth = getFirebaseAuth();
  onAuthStateChanged(auth, (firebaseUser) => {
    user.set(firebaseUser);
    authLoading.set(false);
  });
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function getIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }
  return currentUser.getIdToken();
}
