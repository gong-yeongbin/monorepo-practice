import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/app';
import { worker } from '@/mocks/browser';

if (import.meta.env.DEV) {
	worker.start();
}

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
