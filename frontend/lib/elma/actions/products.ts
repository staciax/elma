'use server';
import axios from '@/lib/axios';

import type { Product, Products } from '../types/products';

export const getProduct = async (id: string): Promise<Product[]> => {
	console.log('product id:', id);
	try {
		const response = await axios.get(`/v1/products/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getProducts = async (): Promise<Products> => {
	try {
		const response = await axios.get('/v1/products/');
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
