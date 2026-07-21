import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { worker } from './mocks/browser';

if (import.meta.env.DEV) {
	worker.start();
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root'),
);
