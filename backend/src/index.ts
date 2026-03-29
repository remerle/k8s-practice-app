import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { config } from './config.js';
import dbPlugin from './plugins/db.js';
import firebasePlugin from './plugins/firebase.js';
import healthRoutes from './routes/health.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';

const app = Fastify({ logger: true });

await app.register(cors);
await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
await app.register(fastifyStatic, {
  root: path.resolve(config.imageStoragePath),
  prefix: '/images/',
  decorateReply: false,
});
await app.register(dbPlugin);
await app.register(firebasePlugin);

await app.register(healthRoutes);
await app.register(productRoutes);
await app.register(adminRoutes);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    process.exit(0);
  });
}

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
