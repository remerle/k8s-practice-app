import fp from 'fastify-plugin';
import Knex from 'knex';
import { FastifyPluginAsync } from 'fastify';
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
  });

  app.decorate('knex', knex);

  app.addHook('onClose', async () => {
    await knex.destroy();
  });

  await knex.migrate.latest({
    directory: './src/migrations',
    extension: 'ts',
  });

  app.log.info('Database connected and migrations applied');
};

export default fp(dbPlugin, { name: 'db' });
