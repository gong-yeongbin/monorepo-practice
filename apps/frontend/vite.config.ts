// admin-frontend Vite 빌드/개발 서버 설정 (React 17, 포트 3000)
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		outDir: 'dist',
	},
});
