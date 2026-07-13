// campaign 목록 조회 쿼리(advertising 단위 필터) DTO
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCampaignDto {
	@Type(() => Number)
	@IsInt()
	advertisingId: number;
}
