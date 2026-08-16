import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateReservationDto {
	@ApiProperty({ description: '변경 캠페인명', example: '테스트 캠페인 v2' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: '변경 트래킹 URL', example: 'https://app.appsflyer.com/com.example.app?pid=new' })
	@IsNotEmpty()
	@IsString()
	tracking_url: string;

	@ApiProperty({ description: '예약 일시(KST, 시 단위)', example: '2026-08-20 10:00:00' })
	@Matches(/^\d{4}-\d{2}-\d{2} \d{2}:00:00$/, { message: 'reserved_at must be YYYY-MM-DD HH:00:00' })
	reserved_at: string;

	@ApiProperty({ description: '대상 campaign id 목록(캠페인마다 예약 행이 생성된다)', example: [1, 2], type: [Number] })
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@IsInt({ each: true })
	@Type(() => Number)
	campaign_ids: number[];
}
