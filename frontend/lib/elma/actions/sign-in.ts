'use server';

import axios from '@/lib/axios';
import type { Token } from '@/lib/elma/types';

export const signIn = async (email: string, password: string): Promise<Token> => {
	console.log(`signin: ${email}, ${password}`);
	try {
		const response = await axios.post('/v1/auth/sign', {
			// TODO: remove hard-coded values
			username: 'test@test.com',
			password: '***REMOVED***',
		});
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};
