/**
 * API client for the backend. All product data flows through these functions.
 * The apiUrl is passed from the layout server load function.
 */

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  image_location: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchProducts(apiUrl: string): Promise<Product[]> {
  const res = await fetch(`${apiUrl}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchProduct(apiUrl: string, id: number): Promise<Product> {
  const res = await fetch(`${apiUrl}/api/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  }
  return res.json();
}

export async function createProduct(apiUrl: string, token: string, data: FormData): Promise<Product> {
  const res = await fetch(`${apiUrl}/api/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to create product: ${res.status}`);
  }
  return res.json();
}

export async function updateProduct(apiUrl: string, token: string, id: number, data: FormData): Promise<Product> {
  const res = await fetch(`${apiUrl}/api/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to update product: ${res.status}`);
  }
  return res.json();
}

export async function deleteProduct(apiUrl: string, token: string, id: number): Promise<void> {
  const res = await fetch(`${apiUrl}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product ${id}: ${res.status}`);
  }
}
