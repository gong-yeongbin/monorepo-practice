// user 목록 조회 쿼리 DTO — 승인 대기 목록은 ?approved=false로 조회한다
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListUserDto {
	@ApiPropertyOptional({ description: '가입 승인 여부 필터(생략 시 전체)', example: false })
	@IsOptional()
	// 쿼리 값은 문자열이라 'true'만 true로 본다.
	// approved를 아예 주지 않으면 class-transformer가 이 함수를 호출하지 않아 undefined로 남는다(= 필터 없음).
	@Transform(({ value }) => value === 'true')
	@IsBoolean()
	approved?: boolean;
}
