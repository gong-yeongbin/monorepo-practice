// @Type(() => Number) 변환이 경로 파라미터 문자열을 숫자로 바꾸는지 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { CampaignIdDto } from './campaign-id.dto';

describe('CampaignIdDto', () => {
	it('id 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(CampaignIdDto, { id: '10' });

		expect(dto.id).toBe(10);
	});
});
