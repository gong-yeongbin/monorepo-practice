import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
	it('local 전략 기반 가드로 인스턴스화된다', () => {
		expect(new LocalAuthGuard()).toBeInstanceOf(LocalAuthGuard);
	});
});
