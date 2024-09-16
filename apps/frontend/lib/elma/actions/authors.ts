'use server';

import axios from '@/lib/axios';

import type { AuthorPublic, AuthorsPublic } from '../types/authors';

export const getAuthor = async (id: string): Promise<AuthorPublic[]> => {
	try {
		const response = await axios.get(`/v1/authors/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getAuthors = async (options?: {
	limit?: number;
	offset?: number;
}): Promise<AuthorsPublic> => {
	try {
		const response = await axios.get('/v1/authors/', {
			params: options,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
