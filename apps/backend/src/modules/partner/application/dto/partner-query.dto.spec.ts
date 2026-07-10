// PartnerIdDto의 @Type(() => Number) 변환을 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { PartnerIdDto } from './partner-query.dto';

describe('PartnerIdDto', () => {
	it('id 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(PartnerIdDto, { id: '9' });
		expect(dto.id).toBe(9);
	});
});
