import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp, seedProducts } from '../helper.js';

describe('GET /api/products', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
  });
  afterEach(async () => {
    await app.close();
  });

  it('returns empty array when no products exist', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('returns all products', async () => {
    await seedProducts(app);
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    expect(res.statusCode).toBe(200);
    const products = res.json();
    expect(products).toHaveLength(2);
    expect(products[0]).toHaveProperty('name', 'Widget');
    expect(products[1]).toHaveProperty('name', 'Gadget');
  });

  it('paginates results with limit and offset', async () => {
    await seedProducts(app);
    const res = await app.inject({
      method: 'GET',
      url: '/api/products?limit=1&offset=0',
    });
    expect(res.statusCode).toBe(200);
    const products = res.json();
    expect(products).toHaveLength(1);
  });

  it('defaults to 50 items when no limit specified', async () => {
    await seedProducts(app);
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });

  it('caps limit at 100', async () => {
    await seedProducts(app);
    const res = await app.inject({
      method: 'GET',
      url: '/api/products?limit=999',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });
});

describe('GET /api/products/:id', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
  });
  afterEach(async () => {
    await app.close();
  });

  it('returns a single product by id', async () => {
    await seedProducts(app);
    const all = await app.inject({ method: 'GET', url: '/api/products' });
    const id = all.json()[0].id;

    const res = await app.inject({ method: 'GET', url: `/api/products/${id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('name', 'Widget');
  });

  it('returns 404 for non-existent product', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products/99999' });
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products/abc' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/invalid/i);
  });
});
