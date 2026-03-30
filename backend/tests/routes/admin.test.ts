import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import Knex from 'knex';
import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import adminRoutes from '../../src/routes/admin.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TEST_DB_URL = process.env.DATABASE_URL ?? 'postgres://shop:shop@localhost:5432/shop';

async function buildRejectingAuthApp() {
  const app = Fastify({ logger: false });
  const knex = Knex.default({ client: 'pg', connection: TEST_DB_URL });

  const imageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-images-'));

  const dbPlugin = fp(
    async (instance) => {
      instance.decorate('knex', knex);
      instance.addHook('onClose', async () => {
        await knex.destroy();
      });
    },
    { name: 'db' },
  );

  const rejectingAuth = fp(
    async (instance) => {
      instance.decorate(
        'verifyFirebaseToken',
        async (_request: FastifyRequest, reply: FastifyReply) => {
          return reply.status(401).send({ error: 'Invalid or expired token' });
        },
      );
    },
    { name: 'firebase' },
  );

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(dbPlugin);
  await app.register(rejectingAuth);
  await app.register(adminRoutes, { imageStoragePath: imageDir });

  await knex('products').del();

  return { app, knex, imageDir };
}

async function buildAdminApp() {
  const app = Fastify({ logger: false });
  const knex = Knex.default({ client: 'pg', connection: TEST_DB_URL });

  const imageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-images-'));

  const dbPlugin = fp(
    async (instance) => {
      instance.decorate('knex', knex);
      instance.addHook('onClose', async () => {
        await knex.destroy();
      });
    },
    { name: 'db' },
  );

  const fakeAuth = fp(
    async (instance) => {
      instance.decorate('verifyFirebaseToken', async () => {
        // no-op in tests: all requests are authorized
      });
    },
    { name: 'firebase' },
  );

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(dbPlugin);
  await app.register(fakeAuth);
  await app.register(adminRoutes, { imageStoragePath: imageDir });

  await knex('products').del();

  return { app, knex, imageDir };
}

describe('Auth preHandler rejection', () => {
  let app: Awaited<ReturnType<typeof Fastify>>;
  let knex: Knex.Knex;
  let imageDir: string;

  beforeEach(async () => {
    const built = await buildRejectingAuthApp();
    app = built.app;
    knex = built.knex;
    imageDir = built.imageDir;
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(imageDir, { recursive: true, force: true });
  });

  it('blocks route handler execution when token is invalid', async () => {
    const form = new FormData();
    form.append('name', 'Should Not Exist');
    form.append('sku', 'AUTH-FAIL-001');
    form.append('price', '10.00');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer bad-token' },
    });

    expect(res.statusCode).toBe(401);

    const products = await knex('products').where({ sku: 'AUTH-FAIL-001' });
    expect(products).toHaveLength(0);
  });

  it('returns 401 for DELETE when token is invalid', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Protected', sku: 'AUTH-FAIL-002', price: 5.0 })
      .returning('*');

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/products/${product.id}`,
      headers: { authorization: 'Bearer bad-token' },
    });

    expect(res.statusCode).toBe(401);

    const remaining = await knex('products').where({ id: product.id });
    expect(remaining).toHaveLength(1);
  });
});

describe('POST /api/products', () => {
  let app: Awaited<ReturnType<typeof Fastify>>;
  let _knex: Knex.Knex;
  let imageDir: string;

  beforeEach(async () => {
    const built = await buildAdminApp();
    app = built.app;
    _knex = built.knex;
    imageDir = built.imageDir;
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(imageDir, { recursive: true, force: true });
  });

  it('creates a product without an image', async () => {
    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('sku', 'TST-001');
    form.append('price', '29.99');
    form.append('description', 'A test product');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('name', 'Test Product');
    expect(body).toHaveProperty('sku', 'TST-001');
    expect(body).toHaveProperty('price', '29.99');
  });

  it('rejects upload with disallowed file extension', async () => {
    const form = new FormData();
    form.append('name', 'XSS Product');
    form.append('sku', 'XSS-001');
    form.append('price', '9.99');
    form.append(
      'image',
      new Blob(['<script>alert(1)</script>'], { type: 'text/html' }),
      'evil.html',
    );

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/file type/i);
  });

  it('accepts upload with allowed image extension', async () => {
    const form = new FormData();
    form.append('name', 'Image Product');
    form.append('sku', 'IMG-001');
    form.append('price', '19.99');
    form.append('image', new Blob([new Uint8Array(8)], { type: 'image/png' }), 'photo.png');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveProperty('image_location');
  });

  it('rejects invalid price format', async () => {
    const form = new FormData();
    form.append('name', 'Bad Price');
    form.append('sku', 'BP-001');
    form.append('price', 'abc');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/price/i);
  });

  it('rejects negative price', async () => {
    const form = new FormData();
    form.append('name', 'Negative Price');
    form.append('sku', 'NP-001');
    form.append('price', '-5.00');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/price/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const form = new FormData();
    form.append('name', 'Incomplete');

    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/products/:id', () => {
  let app: Awaited<ReturnType<typeof Fastify>>;
  let knex: Knex.Knex;
  let imageDir: string;

  beforeEach(async () => {
    const built = await buildAdminApp();
    app = built.app;
    knex = built.knex;
    imageDir = built.imageDir;
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(imageDir, { recursive: true, force: true });
  });

  it('deletes a product', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Delete Me', sku: 'DEL-001', price: 5.0 })
      .returning('*');

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/products/${product.id}`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(200);
    const remaining = await knex('products').where({ id: product.id });
    expect(remaining).toHaveLength(0);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/products/99999',
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/products/abc',
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/invalid/i);
  });
});
