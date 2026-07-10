// @Type(() => Number) 변환과 기본값을 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { ListAdvertisingDto } from './list-advertising.dto';

describe('ListAdvertisingDto', () => {
	it('offset·limit 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(ListAdvertisingDto, { search: 'a', offset: '10', limit: '30' });

		expect(dto.offset).toBe(10);
		expect(dto.limit).toBe(30);
		expect(dto.search).toBe('a');
	});
});
