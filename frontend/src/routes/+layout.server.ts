import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

function requireEnv(name: string): string {
  const value = env[name as keyof typeof env];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const load: LayoutServerLoad = async () => {
  return {
    apiUrl: env.API_URL ?? 'http://localhost:3000',
    firebase: {
      apiKey: requireEnv('FIREBASE_API_KEY'),
      authDomain: requireEnv('FIREBASE_AUTH_DOMAIN'),
      projectId: requireEnv('FIREBASE_PROJECT_ID'),
      storageBucket: requireEnv('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: requireEnv('FIREBASE_MESSAGING_SENDER_ID'),
      appId: requireEnv('FIREBASE_APP_ID'),
    },
  };
};
