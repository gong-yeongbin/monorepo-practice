// 로그인 기록 목록 조회 쿼리 DTO — user_id를 생략하면 전체(최신순). offset·limit은 advertising 목록과 같은 규약
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ListLoginHistoryDto {
	@ApiPropertyOptional({ description: '특정 user의 기록만 조회(생략 시 전체)', example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	user_id?: number;

	@ApiPropertyOptional({ description: '페이징 offset', default: 0 })
	@Type(() => Number)
	@IsInt()
	offset: number = 0;

	@ApiPropertyOptional({ description: '페이지 크기', default: 20 })
	@Type(() => Number)
	@IsInt()
	limit: number = 20;
}
