// poolConfig 풀 옵션 조립 순수 함수 테스트
import { poolConfig } from './prisma.service';

describe('poolConfig', () => {
	const url = 'postgresql://postgres:pw@localhost:5432/mecross';

	it('limit이 없으면 connectionString만 반환한다', () => {
		expect(poolConfig(url, undefined)).toEqual({ connectionString: url });
		expect(poolConfig(url, '')).toEqual({ connectionString: url });
		expect(poolConfig(url, 'abc')).toEqual({ connectionString: url });
	});

	it('limit이 있으면 max로 변환한다', () => {
		expect(poolConfig(url, '30')).toEqual({ connectionString: url, max: 30 });
	});
});
