import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PartnerIdDto {
	@ApiProperty({ description: '파트너(advertiser 또는 media) id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}

export class PartnerTypeDto {
	// type=media면 media 기준, 그 외(생략 포함)면 advertiser 기준으로 집계
	@ApiPropertyOptional({ description: 'media면 media 기준, 그 외(생략 포함)는 advertiser 기준 집계', example: 'media' })
	@IsOptional()
	@IsString()
	type?: string;
}
