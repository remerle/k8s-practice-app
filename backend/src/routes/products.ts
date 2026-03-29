import { FastifyPluginAsync } from 'fastify';

const productRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/products', async () => {
    return app.knex('products').select('*').orderBy('created_at', 'desc');
  });

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
