import { AppController } from './app.controller';

describe('AppController', () => {
	it('health 상태를 반환한다', () => {
		expect(new AppController().health()).toEqual({ status: 'ok' });
	});
});
