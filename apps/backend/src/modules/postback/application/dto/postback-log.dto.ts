// 어드민 포스트백 로그 조회 쿼리 DTO들. 날짜는 KST 일자 경계로 해석한다.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

// install 로그: token 또는 view_code 중 하나 필수(일자별 상세 화면은 view_code로 조회)
export class InstallLogDto {
	@ApiPropertyOptional({ description: '캠페인 token(view_code가 없으면 필수)', example: 'CAMPAIGN_TOKEN' })
	@ValidateIf((dto: InstallLogDto) => !dto.view_code)
	@IsNotEmpty()
	@IsString()
	token?: string;

	@ApiPropertyOptional({ description: 'view code(일자별 상세 화면용)', example: 'VIEW_CODE' })
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	view_code?: string;

	@ApiProperty({ description: '시작 일자(YYYY-MM-DD)', example: '2026-07-01' })
	@IsDateString()
	start_date: string;

	@ApiProperty({ description: '종료 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	end_date: string;
}

// event 로그: campaign_config로 admin 이벤트명 → 트래커 이벤트명 변환이 필요해 token 필수
export class EventLogDto {
	@ApiProperty({ description: '캠페인 token', example: 'CAMPAIGN_TOKEN' })
	@IsNotEmpty()
	@IsString()
	token: string;

	@ApiPropertyOptional({ description: 'view code(일자별 상세 화면용)', example: 'VIEW_CODE' })
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	view_code?: string;

	@ApiProperty({ description: 'admin 이벤트명(campaign_config.admin_event_name)', example: 'purchase' })
	@IsNotEmpty()
	@IsString()
	event_name: string;

	@ApiProperty({ description: '시작 일자(YYYY-MM-DD)', example: '2026-07-01' })
	@IsDateString()
	start_date: string;

	@ApiProperty({ description: '종료 일자(YYYY-MM-DD)', example: '2026-07-22' })
	@IsDateString()
	end_date: string;
}

// 미등록 이벤트 카운트: token 기준
export class UnregisteredLogDto {
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
}
