// config 조회·교체 대상 campaign을 식별하는 경로 파라미터 DTO
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CampaignIdDto {
	@Type(() => Number)
	@IsInt()
	campaignId: number;
}
