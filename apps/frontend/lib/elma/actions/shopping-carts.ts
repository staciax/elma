'use server';

import axios from '@/lib/axios';
import type { BookPublic } from '../types';
import type { ShoppingCart } from '../types/shopping-carts';

export const getShoppingCartMe = async (): Promise<BookPublic[]> => {
	try {
		// cache busting
		// ?timestamp=${new Date().getTime()}
		const response = await axios.get('/v1/carts/me', {
			headers: {
				'Cache-Control': 'no-cache',
			},
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const addBookToCartMe = async (
	book_id: string,
): Promise<ShoppingCart[]> => {
	try {
		const response = await axios.post(
			'/v1/carts/me',
			{ book_id },
			{
				headers: {
					'Cache-Control': 'no-cache',
				},
			},
		);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
