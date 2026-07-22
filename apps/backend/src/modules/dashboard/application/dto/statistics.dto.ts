// 대시보드 통계 조회용 쿼리 DTO들
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 대시보드: 특정 일자
export class DashboardDto {
	@ApiProperty({ description: '집계 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	date: string;
}

// 일별: 날짜 범위 + 선택적 token(없으면 전체 합산)
export class DailyDto {
	@ApiPropertyOptional({ description: '캠페인 token(생략 시 전체 합산)', example: 'CAMPAIGN_TOKEN' })
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	token?: string;

	@ApiProperty({ description: '시작 일자(YYYY-MM-DD)', example: '2026-07-01' })
	@IsDateString()
	start_date: string;

	@ApiProperty({ description: '종료 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	end_date: string;
}

// 상세: 날짜 범위 + 선택적 media_id
export class DetailDto {
	@ApiProperty({ description: '시작 일자(YYYY-MM-DD)', example: '2026-07-01' })
	@IsDateString()
	start_date: string;

	@ApiProperty({ description: '종료 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	end_date: string;

	@ApiPropertyOptional({ description: '매체 필터 id', example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	media_id?: number;
}
