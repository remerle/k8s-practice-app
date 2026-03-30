import { FastifyPluginAsync } from 'fastify';

const productRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { limit?: string; offset?: string } }>(
    '/api/products',
    async (request) => {
      const limit = Math.min(Math.max(Number(request.query.limit) || 50, 1), 100);
      const offset = Math.max(Number(request.query.offset) || 0, 0);

      return app
        .knex('products')
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);
    },
  );

  app.get<{ Params: { id: string } }>('/api/products/:id', async (request, reply) => {
    const { id } = request.params;
    const product = await app.knex('products').where({ id }).first();
    if (!product) {
      reply.status(404);
      return { error: 'Product not found' };
    }
    return product;
  });
};

export default productRoutes;
