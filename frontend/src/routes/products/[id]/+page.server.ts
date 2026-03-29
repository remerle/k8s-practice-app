import { fetchProduct } from '$lib/api';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const apiUrl = env.API_URL ?? 'http://localhost:3000';
  try {
    const product = await fetchProduct(apiUrl, parseInt(params.id, 10));
    return { product };
  } catch {
    error(404, 'Product not found');
  }
};
