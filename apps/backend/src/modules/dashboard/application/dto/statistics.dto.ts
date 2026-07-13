// 대시보드 통계 조회용 쿼리 DTO들
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 대시보드: 특정 일자
export class DashboardDto {
	@IsDateString()
	date: string;
}

// 일별/일별상세: token + 날짜 범위
export class DailyDto {
	@IsNotEmpty()
	@IsString()
	token: string;

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

// 엑셀(전체 조회): 날짜 범위만
export class DailyDetailAllDto {
	@IsDateString()
	start_date: string;

	@IsDateString()
	end_date: string;
}
