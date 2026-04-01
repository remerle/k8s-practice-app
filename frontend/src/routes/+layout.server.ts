import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

const FIREBASE_DEFAULTS = {
  apiKey: 'AIzaSyArt3z_05CcCodv2ed_8L3h2PY2z91kgNc',
  authDomain: 'k8s-practice-app.firebaseapp.com',
  projectId: 'k8s-practice-app',
  storageBucket: 'k8s-practice-app.firebasestorage.app',
  messagingSenderId: '257579486757',
  appId: '1:257579486757:web:a5d08bacb6f10fb7dff9cc',
};

export const load: LayoutServerLoad = async () => {
  return {
    firebase: {
      apiKey: env.FIREBASE_API_KEY ?? FIREBASE_DEFAULTS.apiKey,
      authDomain: env.FIREBASE_AUTH_DOMAIN ?? FIREBASE_DEFAULTS.authDomain,
      projectId: env.FIREBASE_PROJECT_ID ?? FIREBASE_DEFAULTS.projectId,
      storageBucket: env.FIREBASE_STORAGE_BUCKET ?? FIREBASE_DEFAULTS.storageBucket,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID ?? FIREBASE_DEFAULTS.messagingSenderId,
      appId: env.FIREBASE_APP_ID ?? FIREBASE_DEFAULTS.appId,
    },
  };
};
