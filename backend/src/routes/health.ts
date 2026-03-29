import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/health', async (request, reply) => {
    try {
      await app.knex.raw('SELECT 1');
      return { status: 'ok' };
    } catch (_err) {
      reply.status(503);
      return { status: 'error', message: 'Database connection failed' };
    }
  });
};

export default healthRoutes;
