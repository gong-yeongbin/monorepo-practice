// 대시보드 통계 조회용 쿼리 DTO들
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 대시보드: 특정 일자
export class DashboardDto {
	@IsDateString()
	date: string;
}

// 일별: 날짜 범위 + 선택적 token(없으면 전체 합산)
export class DailyDto {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	token?: string;

	@IsDateString()
	start_date: string;

	@IsDateString()
	end_date: string;
}

// 상세: 날짜 범위 + 선택적 media_id
export class DetailDto {
	@IsDateString()
	start_date: string;

	@IsDateString()
	end_date: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	media_id?: number;
}
