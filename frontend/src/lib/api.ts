/**
 * API client for the backend. All product data flows through these functions.
 *
 * apiUrl is optional: omit it (or pass '') for relative paths (client-side),
 * pass the full backend URL for SSR load functions.
 */

interface RawProduct {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  image_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  image_location: string | null;
  created_at: string;
  updated_at: string;
}

/** Formats a numeric price as a dollar string with two decimal places. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function normalizeProduct(raw: RawProduct): Product {
  return { ...raw, price: parseFloat(raw.price) };
}

export async function fetchProducts(apiUrl = ''): Promise<Product[]> {
  const res = await fetch(`${apiUrl}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  const raw: RawProduct[] = await res.json();
  return raw.map(normalizeProduct);
}

export async function fetchProduct(apiUrl = '', id: number): Promise<Product> {
  const res = await fetch(`${apiUrl}/api/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  }
  const raw: RawProduct = await res.json();
  return normalizeProduct(raw);
}

export async function createProduct(token: string, data: FormData): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to create product: ${res.status}`);
  }
  const raw: RawProduct = await res.json();
  return normalizeProduct(raw);
}

export async function updateProduct(token: string, id: number, data: FormData): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to update product: ${res.status}`);
  }
  const raw: RawProduct = await res.json();
  return normalizeProduct(raw);
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product ${id}: ${res.status}`);
  }
}
