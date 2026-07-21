import axios from 'axios';

export const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use(config => {
	const accessToken = sessionStorage.getItem('accessToken');
	if (config.headers) {
		config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : '';
	}
	return config;
});
