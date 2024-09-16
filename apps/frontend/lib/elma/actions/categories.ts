'use server';

import axios from '@/lib/axios';

import type { CategoriesPublic, CategoryPublic } from '../types/categories';

export const getCategory = async (id: string): Promise<CategoryPublic[]> => {
	console.log('product id:', id);
	try {
		const response = await axios.get(`/v1/categories/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getCategories = async (options?: {
	limit?: number;
	offset?: number;
}): Promise<CategoriesPublic> => {
	try {
		const response = await axios.get('/v1/categories/', {
			params: options,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
