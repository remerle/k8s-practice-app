import Fastify from 'fastify';
import Knex from 'knex';
import fp from 'fastify-plugin';
import productRoutes from '../src/routes/products.js';

const TEST_DB_URL = process.env.DATABASE_URL ?? 'postgres://shop:shop@localhost:5432/shop';

/**
 * Creates a Fastify instance with a real database connection for integration tests.
 * Cleans the products table before each use.
 */
export async function buildApp() {
  const app = Fastify({ logger: false });

  const knex = Knex.default({ client: 'pg', connection: TEST_DB_URL });
  const dbPlugin = fp(async (instance) => {
    instance.decorate('knex', knex);
    instance.addHook('onClose', async () => { await knex.destroy(); });
  }, { name: 'db' });

  await app.register(dbPlugin);
  await app.register(productRoutes);

  await knex('products').del();

  return app;
}

export async function seedProducts(app: ReturnType<typeof Fastify>) {
  const knex = (app as any).knex;
  await knex('products').insert([
    { name: 'Widget', description: 'A fine widget', sku: 'WDG-001', price: 9.99 },
    { name: 'Gadget', description: 'A cool gadget', sku: 'GDG-001', price: 19.99 },
  ]);
}
