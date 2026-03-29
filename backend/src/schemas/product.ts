export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    sku: { type: 'string' },
    price: { type: 'string' },
    image_location: { type: ['string', 'null'] },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
} as const;

export const productListSchema = {
  type: 'array',
  items: productSchema,
} as const;

export const createProductSchema = {
  type: 'object',
  required: ['name', 'sku', 'price'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string' },
    sku: { type: 'string', minLength: 1, maxLength: 100 },
    price: { type: 'string', pattern: '^\\d+\\.?\\d{0,2}$' },
  },
} as const;
