import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/app';
import { worker } from '@/mocks/browser';

// dev 모드에서는 MSW 워커가 준비된 뒤에 렌더한다. 기다리지 않으면 새로고침 직후
// 첫 요청이 목에 잡히지 않고 실제 backend로 흘러가 404 → 로그인 이동으로 이어진다.
async function enableMocking() {
	if (import.meta.env.DEV) {
		// 핸들러에 없는 요청은 실제 backend로 통과시킨다 (bypass는 통과 시 콘솔 경고만 끈 것)
		await worker.start({ onUnhandledRequest: 'bypass' });
	}
}

enableMocking().then(() => {
	createRoot(document.getElementById('root')!).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
});
