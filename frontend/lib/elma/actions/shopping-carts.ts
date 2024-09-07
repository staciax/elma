'use server';

import axios from '@/lib/axios';
import type { Product } from '../types';

type ShoppingCart = {
	product_id: string;
	user_id: string;
};

export const getShoppingCartMe = async (): Promise<Product[]> => {
	try {
		const response = await axios.get('/v1/carts/me');
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const addProductToCartMe = async (product_id: string): Promise<ShoppingCart[]> => {
	try {
		const response = await axios.post('/v1/carts/me', { product_id });
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
