// DetailDto의 @Type(() => Number) media_id 변환을 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { DetailDto } from './statistics.dto';

describe('DetailDto', () => {
	it('media_id 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(DetailDto, { start_date: '2026-07-01', end_date: '2026-07-10', media_id: '2' });
		expect(dto.media_id).toBe(2);
	});

	it('media_id가 없으면 undefined', () => {
		const dto = plainToInstance(DetailDto, { start_date: '2026-07-01', end_date: '2026-07-10' });
		expect(dto.media_id).toBeUndefined();
	});
});
