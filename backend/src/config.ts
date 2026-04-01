interface Config {
  databaseUrl: string;
  imageStoragePath: string;
  port: number;
  firebaseProjectId: string;
  corsOrigin: string;
}

const DEFAULT_DEV_DATABASE_URL = 'postgres://shop:shop@localhost:5432/shop';
const DEFAULT_DEV_FIREBASE_PROJECT_ID = 'k8s-practice-app';

function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(value: string): number {
  const port = parseInt(value, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: "${value}" (must be an integer between 1 and 65535)`);
  }
  return port;
}

export const config: Config = {
  databaseUrl: requireEnv('DATABASE_URL', DEFAULT_DEV_DATABASE_URL),
  imageStoragePath: process.env.IMAGE_STORAGE_PATH ?? './images',
  port: parsePort(process.env.PORT ?? '3000'),
  firebaseProjectId: requireEnv('FIREBASE_PROJECT_ID', DEFAULT_DEV_FIREBASE_PROJECT_ID),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
