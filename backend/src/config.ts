import 'dotenv/config';

interface Config {
  databaseUrl: string;
  imageStoragePath: string;
  port: number;
  firebaseProjectId: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: Config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  imageStoragePath: process.env.IMAGE_STORAGE_PATH ?? './images',
  port: parseInt(process.env.PORT ?? '3000', 10),
  firebaseProjectId: requireEnv('FIREBASE_PROJECT_ID'),
};
