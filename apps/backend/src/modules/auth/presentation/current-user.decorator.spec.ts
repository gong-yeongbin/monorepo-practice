import { ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@auth/application/token.constants';
import { currentUserFactory } from './current-user.decorator';

describe('currentUserFactory', () => {
	it('JwtAuthGuard가 request.user에 실어 둔 payload를 반환한다', () => {
		const user: AccessTokenPayload = { sub: 1, email: 'a@test.com', role: 'USER', advertising_ids: [1] };
		const context = { switchToHttp: () => ({ getRequest: () => ({ user }) }) } as unknown as ExecutionContext;

		expect(currentUserFactory(undefined, context)).toBe(user);
	});
});
