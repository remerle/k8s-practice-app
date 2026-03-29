import { fetchProducts } from '$lib/api';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const apiUrl = env.API_URL ?? 'http://localhost:3000';
  const products = await fetchProducts(apiUrl);
  return { products };
};
