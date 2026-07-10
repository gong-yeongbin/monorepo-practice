// @Type(() => Number) 변환이 문자열 id를 숫자로 바꾸는지 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { CreateAdvertisingDto } from './create-advertising.dto';

describe('CreateAdvertisingDto', () => {
	it('advertiser_id·tracker_id 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(CreateAdvertisingDto, { name: 'ad', advertiser_id: '1', tracker_id: '2', image: 'https://img' });

		expect(dto.advertiser_id).toBe(1);
		expect(dto.tracker_id).toBe(2);
		expect(dto.image).toBe('https://img');
	});
});
