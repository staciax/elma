'use server';

import axios from '@/lib/axios';
import { AxiosError, type AxiosResponse, isAxiosError } from 'axios';
import type { BookPublic } from '../types';
import type { ShoppingCart } from '../types/shopping-carts';

export const getShoppingCartMe = async (): Promise<{ data: BookPublic[] }> => {
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

type Response<R> = {
	data: R;
	error?: {
		name: string;
		message: string;
		status?: number;
	};
};

export const addBookToCartMe = async (
	book_id: string,
): Promise<Response<ShoppingCart[]>> => {
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
		return {
			data: response.data,
		};
	} catch (error) {
		if (isAxiosError(error)) {
			const { response } = error;
			return {
				data: response?.data,
				error: {
					name: error.name,
					message: error.message,
					status: error?.status,
				},
			};
		}
		return Promise.reject(error);
	}
};
