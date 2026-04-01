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

type AuthMode = 'allow' | 'reject';

async function buildAdminApp(authMode: AuthMode = 'allow') {
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

  const authPlugin = fp(
    async (instance) => {
      if (authMode === 'reject') {
        instance.decorate(
          'verifyFirebaseToken',
          async (_request: FastifyRequest, reply: FastifyReply) => {
            return reply.status(401).send({ error: 'Invalid or expired token' });
          },
        );
      } else {
        instance.decorate('verifyFirebaseToken', async () => {
          // no-op in tests: all requests are authorized
        });
      }
    },
    { name: 'firebase' },
  );

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(dbPlugin);
  await app.register(authPlugin);
  await app.register(adminRoutes, { imageStoragePath: imageDir });

  await knex('products').del();

  return { app, knex, imageDir };
}

describe('Auth preHandler rejection', () => {
  let app: Awaited<ReturnType<typeof Fastify>>;
  let knex: Knex.Knex;
  let imageDir: string;

  beforeEach(async () => {
    const built = await buildAdminApp('reject');
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

  it('accepts upload with allowed image extension and writes file to disk', async () => {
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
    const body = res.json();
    expect(body).toHaveProperty('image_location');
    expect(fs.existsSync(path.join(imageDir, body.image_location))).toBe(true);
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

describe('PUT /api/products/:id', () => {
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

  it('updates product fields', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Original', sku: 'UPD-001', price: 10.0 })
      .returning('*');

    const form = new FormData();
    form.append('name', 'Updated Name');
    form.append('price', '15.50');

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${product.id}`,
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('name', 'Updated Name');
    expect(body).toHaveProperty('price', '15.50');
    expect(body).toHaveProperty('sku', 'UPD-001');
  });

  it('replaces product image and cleans up old file', async () => {
    // Create a product with an image via POST
    const createForm = new FormData();
    createForm.append('name', 'Image Product');
    createForm.append('sku', 'UPD-IMG-001');
    createForm.append('price', '20.00');
    createForm.append(
      'image',
      new Blob([new Uint8Array(8)], { type: 'image/png' }),
      'original.png',
    );

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: createForm,
      headers: { authorization: 'Bearer fake-token' },
    });
    const created = createRes.json();
    const oldImagePath = path.join(imageDir, created.image_location);
    expect(fs.existsSync(oldImagePath)).toBe(true);

    // Update with a new image
    const updateForm = new FormData();
    updateForm.append(
      'image',
      new Blob([new Uint8Array(16)], { type: 'image/jpeg' }),
      'replacement.jpg',
    );

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${created.id}`,
      payload: updateForm,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.image_location).not.toBe(created.image_location);
    expect(fs.existsSync(path.join(imageDir, body.image_location))).toBe(true);

    // Old image should be cleaned up (give async unlink a moment)
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fs.existsSync(oldImagePath)).toBe(false);
  });

  it('rejects zero price', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Zero Price', sku: 'UPD-ZP-001', price: 10.0 })
      .returning('*');

    const form = new FormData();
    form.append('price', '0');

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${product.id}`,
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/price/i);
  });

  it('rejects invalid price format', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Bad Update', sku: 'UPD-BP-001', price: 10.0 })
      .returning('*');

    const form = new FormData();
    form.append('price', 'not-a-number');

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${product.id}`,
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/price/i);
  });

  it('returns 404 for non-existent product', async () => {
    const form = new FormData();
    form.append('name', 'Ghost');

    const res = await app.inject({
      method: 'PUT',
      url: '/api/products/99999',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for non-numeric id', async () => {
    const form = new FormData();
    form.append('name', 'Bad ID');

    const res = await app.inject({
      method: 'PUT',
      url: '/api/products/abc',
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/invalid/i);
  });

  it('rejects disallowed image extension', async () => {
    const [product] = await knex('products')
      .insert({ name: 'Bad Ext', sku: 'UPD-EXT-001', price: 10.0 })
      .returning('*');

    const form = new FormData();
    form.append(
      'image',
      new Blob(['<script>alert(1)</script>'], { type: 'text/html' }),
      'evil.html',
    );

    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${product.id}`,
      payload: form,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/file type/i);
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
