import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/app';
import { worker } from '@/mocks/browser';

if (import.meta.env.DEV) {
	// 핸들러에 없는 요청은 실제 backend로 통과시킨다 (bypass는 통과 시 콘솔 경고만 끈 것)
	worker.start({ onUnhandledRequest: 'bypass' });
}

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
