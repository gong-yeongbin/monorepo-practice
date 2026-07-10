import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PartnerIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}

export class PartnerTypeDto {
	// type=media면 media 기준, 그 외(생략 포함)면 advertiser 기준으로 집계
	@IsOptional()
	@IsString()
	type?: string;
}
