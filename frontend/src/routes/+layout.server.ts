import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  return {
    apiUrl: env.API_URL ?? 'http://localhost:3000',
    firebase: {
      apiKey: env.FIREBASE_API_KEY ?? '',
      authDomain: env.FIREBASE_AUTH_DOMAIN ?? '',
      projectId: env.FIREBASE_PROJECT_ID ?? '',
      storageBucket: env.FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: env.FIREBASE_APP_ID ?? '',
    },
  };
};
