import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
	it('jwt 전략 기반 가드로 인스턴스화된다', () => {
		expect(new JwtAuthGuard()).toBeInstanceOf(JwtAuthGuard);
	});
});
