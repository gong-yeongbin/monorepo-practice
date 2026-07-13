// toProfile이 User에서 password를 제거하는지 검증
import { toProfile } from './user.entity';

describe('toProfile', () => {
	it('User에서 password를 제외한 Profile을 반환한다', () => {
		const user = { id: 1, user_id: 'admin', password: 'secret', role: 'ADMIN' as const };

		expect(toProfile(user)).toEqual({ id: 1, user_id: 'admin', role: 'ADMIN' });
	});
});
