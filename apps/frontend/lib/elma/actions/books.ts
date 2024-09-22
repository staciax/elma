'use server';
import axios from '@/lib/axios';

import type { BookPublic, BooksPublic } from '../types/books';

// TODO: remove array of book instead of single book object in getBook from backend
export const getBook = async (id: string): Promise<BookPublic[] | null> => {
	console.log('book id:', id);
	try {
		const response = await axios.get(`/v1/books/${id}/`);
		return response.data;
	} catch (error) {
		return null;
		// return Promise.reject(error);
	}
};

export const getBooks = async (options?: {
	limit?: number;
	offset?: number;
}): Promise<BooksPublic> => {
	try {
		const response = await axios.get('/v1/books/', {
			params: options,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
