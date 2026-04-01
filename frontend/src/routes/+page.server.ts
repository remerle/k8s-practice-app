import { fetchProducts } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { apiUrl } = await parent();
  const products = await fetchProducts(apiUrl);
  return { products };
};
