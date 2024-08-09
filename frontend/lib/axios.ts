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
		const token = cookieStore.get('ac-token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
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
		return Promise.reject(error);
	},
);

export default axios;
