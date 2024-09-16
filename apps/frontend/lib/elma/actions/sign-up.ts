'use server';

import axios from '@/lib/axios';
import type { User } from '@/lib/elma/types';

export const signUp = async (
	email: string,
	password: string,
	first_name: string,
	last_name: string,
): Promise<User> => {
	try {
		const response = await axios.post('/v1/users/signup', {
			email: email,
			password: password,
			first_name: first_name,
			last_name: last_name,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
