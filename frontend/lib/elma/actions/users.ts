'use server';

import axios from '@/lib/axios';
import type { UserPublic } from '../types';

export const getUserMe = async (): Promise<UserPublic> => {
	try {
		const response = await axios.get('/v1/users/me');
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
