import { fetchProduct } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { apiUrl } = await parent();
  try {
    const product = await fetchProduct(apiUrl, parseInt(params.id, 10));
    return { product };
  } catch {
    error(404, 'Product not found');
  }
};
