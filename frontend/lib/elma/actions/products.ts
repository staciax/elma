'use server';
import axios from '@/lib/axios';

import type { ProductPublic, ProductsPublic } from '../types/products';

export const getProduct = async (id: string): Promise<ProductPublic[]> => {
	console.log('product id:', id);
	try {
		const response = await axios.get(`/v1/products/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getProducts = async (options?: {
	limit?: number;
	offset?: number;
}): Promise<ProductsPublic> => {
	try {
		const response = await axios.get('/v1/products/', {
			params: options,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
