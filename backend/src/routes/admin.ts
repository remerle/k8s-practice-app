import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { config } from '../config.js';

function parseProductId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const PRICE_PATTERN = /^\d+\.?\d{0,2}$/;

interface AdminRoutesOptions {
  imageStoragePath?: string;
}

const adminRoutes: FastifyPluginAsync<AdminRoutesOptions> = async (app, opts) => {
  app.addHook('preHandler', app.verifyFirebaseToken);

  const imageDir = opts.imageStoragePath ?? path.resolve(config.imageStoragePath);

  fs.mkdirSync(imageDir, { recursive: true });

  app.post('/api/products', async (request, reply) => {
    const fields: Record<string, string> = {};
    let imageLocation: string | null = null;

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        const ext = path.extname(part.filename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
          reply.status(400);
          return { error: `Unsupported file type: ${ext}` };
        }
        const filename = `${randomUUID()}${ext}`;
        const filepath = path.join(imageDir, filename);
        await pipeline(part.file, fs.createWriteStream(filepath));
        imageLocation = filename;
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (!fields.name || !fields.sku || !fields.price) {
      reply.status(400);
      return { error: 'Missing required fields: name, sku, price' };
    }

    if (!PRICE_PATTERN.test(fields.price) || parseFloat(fields.price) <= 0) {
      reply.status(400);
      return {
        error: 'Invalid price format: must be a positive number with up to 2 decimal places',
      };
    }

    const [product] = await app
      .knex('products')
      .insert({
        name: fields.name,
        description: fields.description ?? null,
        sku: fields.sku,
        price: fields.price,
        image_location: imageLocation,
      })
      .returning('*');

    reply.status(201);
    return product;
  });

  app.put<{ Params: { id: string } }>('/api/products/:id', async (request, reply) => {
    const id = parseProductId(request.params.id);
    if (id === null) {
      reply.status(400);
      return { error: 'Invalid product ID' };
    }

    const existing = await app.knex('products').where({ id }).first();
    if (!existing) {
      reply.status(404);
      return { error: 'Product not found' };
    }

    const fields: Record<string, string> = {};
    let imageLocation: string | undefined;

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        const ext = path.extname(part.filename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
          reply.status(400);
          return { error: `Unsupported file type: ${ext}` };
        }
        const filename = `${randomUUID()}${ext}`;
        const filepath = path.join(imageDir, filename);
        await pipeline(part.file, fs.createWriteStream(filepath));

        if (existing.image_location) {
          const oldPath = path.join(imageDir, existing.image_location);
          fs.unlink(oldPath, (err) => {
            if (err && err.code !== 'ENOENT') {
              app.log.warn({ err, path: oldPath }, 'Failed to delete old product image');
            }
          });
        }

        imageLocation = filename;
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (fields.price && (!PRICE_PATTERN.test(fields.price) || parseFloat(fields.price) <= 0)) {
      reply.status(400);
      return {
        error: 'Invalid price format: must be a positive number with up to 2 decimal places',
      };
    }

    const updates: Record<string, unknown> = { updated_at: app.knex.fn.now() };
    if (fields.name) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.sku) updates.sku = fields.sku;
    if (fields.price) updates.price = fields.price;
    if (imageLocation !== undefined) updates.image_location = imageLocation;

    const [product] = await app.knex('products').where({ id }).update(updates).returning('*');

    return product;
  });

  app.delete<{ Params: { id: string } }>('/api/products/:id', async (request, reply) => {
    const id = parseProductId(request.params.id);
    if (id === null) {
      reply.status(400);
      return { error: 'Invalid product ID' };
    }

    const product = await app.knex('products').where({ id }).first();
    if (!product) {
      reply.status(404);
      return { error: 'Product not found' };
    }

    if (product.image_location) {
      const imagePath = path.join(imageDir, product.image_location);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          app.log.warn({ err, path: imagePath }, 'Failed to delete product image');
        }
      });
    }

    await app.knex('products').where({ id }).del();
    return { message: 'Product deleted' };
  });
};

export default adminRoutes;
