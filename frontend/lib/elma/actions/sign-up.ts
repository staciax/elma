'use server';

import axios from '@/lib/axios';
import type { User } from '@/lib/elma/types';

export const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<User> => {
	console.log(`signup ${email}, ${password}, ${firstName}, ${lastName}`);
	try {
		const response = await axios.post('/v1/users/sign-up', {
			// TODO: remove hard-coded values
			email: email,
			password: password,
			firstName: firstName,
			lastName: lastName,
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
