import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '@auth/application/login.use-case';

describe('JwtStrategy', () => {
	const originalSecret = process.env.JWT_SECRET;

	beforeAll(() => {
		process.env.JWT_SECRET = 'test-secret';
	});

	afterAll(() => {
		process.env.JWT_SECRET = originalSecret;
	});

	it('payload에서 user_id·role만 추출해 반환한다', () => {
		const strategy = new JwtStrategy();
		const payload: JwtPayload = { user_id: 'admin', role: 'ADMIN' };

		expect(strategy.validate(payload)).toEqual({ user_id: 'admin', role: 'ADMIN' });
	});
});
