// 대시보드 통계 조회용 쿼리 DTO들
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

// 일자별 상세의 정렬 가능 카운터 컬럼(IsIn 검증용 런타임 배열)
export const COUNTER_FIELDS = ['click', 'install', 'registration', 'retention', 'purchase', 'revenue', 'etc1', 'etc2', 'etc3', 'etc4', 'etc5'] as const;

// 일자별 상세: 날짜 범위 + token + 정렬(카운터 컬럼·방향)
export class DailyDetailDto {
	@ApiProperty({ description: '캠페인 token', example: 'CAMPAIGN_TOKEN' })
	@IsNotEmpty()
	@IsString()
	token: string;

	@ApiProperty({ description: '시작 일자(YYYY-MM-DD)', example: '2026-07-01' })
	@IsDateString()
	start_date: string;

	@ApiProperty({ description: '종료 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	end_date: string;

	@ApiProperty({ description: '정렬 카운터 컬럼', enum: COUNTER_FIELDS, example: 'install' })
	@IsIn(COUNTER_FIELDS)
	type: (typeof COUNTER_FIELDS)[number];

	@ApiProperty({ description: '정렬 방향', enum: ['asc', 'desc'], example: 'desc' })
	@IsIn(['asc', 'desc'])
	order: 'asc' | 'desc';
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
