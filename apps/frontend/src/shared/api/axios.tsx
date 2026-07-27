import axios, { InternalAxiosRequestConfig } from 'axios';

export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(config => {
	const accessToken = sessionStorage.getItem('accessToken');
	if (config.headers) {
		config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : '';
	}
	return config;
});

// 401이면 refresh token으로 access token을 재발급받아 원 요청을 1회 재시도한다.
// refresh 호출은 axiosInstance가 아닌 raw axios를 써서 인터셉터 재진입을 막는다.
axiosInstance.interceptors.response.use(
	response => response,
	async (error: unknown) => {
		if (axios.isAxiosError(error) && error.response?.status === 401 && error.config) {
			const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
			const refreshToken = sessionStorage.getItem('refreshToken');
			if (refreshToken && !originalRequest._retry) {
				originalRequest._retry = true;
				try {
					const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refresh_token: refreshToken });
					sessionStorage.setItem('accessToken', response.data.data.access_token);
					return axiosInstance(originalRequest);
				} catch {
					sessionStorage.clear();
					window.location.href = '/login';
				}
			}
		}
		return Promise.reject(error);
	},
);
