import 'server-only';

import Axios from 'axios';
import { cookies } from 'next/headers';

const axios = Axios.create({
	baseURL: 'http://localhost:8000/api',
	timeout: 5000, // 5 second
	headers: {
		'Content-Type': 'application/json',
	},
});

axios.interceptors.request.use(
	(config) => {
		const cookieStore = cookies();
		const access_token = cookieStore.get('ac-token')?.value;
		if (access_token) {
			config.headers.Authorization = `Bearer ${access_token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle 401 Unauthorized
		// if (Axios.isAxiosError(error) && error?.status === 401) {
		// 	const cookieStore = cookies();
		// 	cookieStore.delete('ac-token');
		// }
		// TODO: client side delete cookie
		return Promise.reject(error);
	},
);

export default axios;
