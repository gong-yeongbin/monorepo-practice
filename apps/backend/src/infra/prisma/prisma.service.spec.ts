// withConnectionLimit URL 조립 순수 함수 테스트
import { withConnectionLimit } from './prisma.service';

describe('withConnectionLimit', () => {
	const url = 'mysql://root:pw@localhost:3306/mecross';

	it('limit이 없으면 URL을 그대로 반환한다', () => {
		expect(withConnectionLimit(url, undefined)).toBe(url);
		expect(withConnectionLimit(url, '')).toBe(url);
		expect(withConnectionLimit(url, 'abc')).toBe(url);
	});

	it('query가 없는 URL에는 ?로 붙인다', () => {
		expect(withConnectionLimit(url, '30')).toBe(`${url}?connectionLimit=30`);
	});

	it('query가 있는 URL에는 &로 붙인다', () => {
		expect(withConnectionLimit(`${url}?ssl=false`, '10')).toBe(`${url}?ssl=false&connectionLimit=10`);
	});
});
