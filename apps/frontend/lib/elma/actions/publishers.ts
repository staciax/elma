'use server';

import axios from '@/lib/axios';

import type { PublisherPublic, PublishersPublic } from '../types/publishers';

export const getPublisher = async (id: string): Promise<PublisherPublic[]> => {
	try {
		const response = await axios.get(`/v1/publishers/${id}/`);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const getPublishers = async (options?: {
	limit?: number;
	offset?: number;
}): Promise<PublishersPublic> => {
	try {
		const response = await axios.get('/v1/publishers/', {
			params: options,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
