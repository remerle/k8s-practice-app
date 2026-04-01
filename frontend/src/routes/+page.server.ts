import { env } from '$env/dynamic/private';
import { fetchProducts } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const apiUrl = env.API_URL ?? 'http://localhost:3000';
  const products = await fetchProducts(apiUrl);
  return { products };
};
