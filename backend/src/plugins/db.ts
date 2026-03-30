import fp from 'fastify-plugin';
import Knex from 'knex';
import { FastifyPluginAsync } from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex.Knex;
  }
}

const dbPlugin: FastifyPluginAsync = async (app) => {
  const knex = Knex.default({
    client: 'pg',
    connection: config.databaseUrl,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  });

  app.decorate('knex', knex);

  app.addHook('onClose', async () => {
    await knex.destroy();
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  await knex.migrate.latest({
    directory: path.join(__dirname, '../migrations'),
  });

  app.log.info('Database connected and migrations applied');
};

export default fp(dbPlugin, { name: 'db' });
