// @Type(() => Number) 변환이 문자열 입력을 숫자로 바꾸는지 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { CreateCampaignDto } from './create-campaign.dto';

describe('CreateCampaignDto', () => {
	it('advertising_id·media_id 문자열을 숫자로 변환한다', () => {
		const dto = plainToInstance(CreateCampaignDto, { name: 'c', type: 'CPI', advertising_id: '5', media_id: '2' });

		expect(dto.advertising_id).toBe(5);
		expect(dto.media_id).toBe(2);
	});
});
