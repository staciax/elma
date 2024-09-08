'use server';

import axios from '@/lib/axios';

export type UserMe = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
};

export const getUserMe = async (): Promise<UserMe> => {
	try {
		const response = await axios.get('/v1/users/me');
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
