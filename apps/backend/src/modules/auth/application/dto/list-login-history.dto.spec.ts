// @Type(() => Number) 변환과 기본값, user_id 생략 시 undefined 유지(= 전체 조회)를 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { ListLoginHistoryDto } from './list-login-history.dto';

describe('ListLoginHistoryDto', () => {
	it('user_id·offset·limit 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(ListLoginHistoryDto, { user_id: '1', offset: '10', limit: '30' });

		expect(dto.user_id).toBe(1);
		expect(dto.offset).toBe(10);
		expect(dto.limit).toBe(30);
	});

	it('user_id를 생략하면 undefined로 남고 offset·limit은 기본값을 쓴다', () => {
		const dto = plainToInstance(ListLoginHistoryDto, {});

		expect(dto.user_id).toBeUndefined();
		expect(dto.offset).toBe(0);
		expect(dto.limit).toBe(20);
	});
});
