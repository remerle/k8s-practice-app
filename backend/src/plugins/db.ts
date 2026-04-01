import fp from 'fastify-plugin';
import knex, { type Knex } from 'knex';
import { FastifyPluginAsync } from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
  }
}

const dbPlugin: FastifyPluginAsync = async (app) => {
  const db = knex({
    client: 'pg',
    connection: config.databaseUrl,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  });

  app.decorate('knex', db);

  app.addHook('onClose', async () => {
    await db.destroy();
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  await db.migrate.latest({
    directory: path.join(__dirname, '../migrations'),
  });

  app.log.info('Database connected and migrations applied');
};

export default fp(dbPlugin, { name: 'db' });
