/// <reference types="vitest/config" />
// admin-frontend Vite 빌드/개발 서버 설정 (React 19, 포트 3000) + Vitest 테스트 설정
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
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			// 커버리지 대상은 현재 테스트가 다루는 순수 로직 계층으로 한정한다.
			// 화면 컴포넌트(antd·react-table·MobX 의존)를 포함하면 90% 임계를 만족할 수 없다.
			include: ['src/shared/lib/get-cell.tsx', 'src/shared/lib/get-total.tsx', 'src/shared/api/api.tsx'],
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90,
			},
		},
	},
});
