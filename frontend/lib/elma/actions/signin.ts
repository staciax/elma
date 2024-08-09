'use server';

import axios from '@/lib/axios';
import type { Token } from '@/lib/elma/types';

export const signin = async (email: string, password: string): Promise<Token> => {
	console.log(`signin: ${email}, ${password}`);
	try {
		const response = await axios.post('/v1/auth/sign', {
			// TODO: remove hard-coded values
			email: 'stacia.dev9@gmail.com',
			password: 'testtest',
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
