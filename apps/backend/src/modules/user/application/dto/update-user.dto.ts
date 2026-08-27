import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { USER_ROLES, UserRole } from '@user/domain/user.entity';

// email은 불변. role·approved(승인 여부)·advertising_ids(허용 광고 목록)만 선택적으로 부분 수정한다.
export class UpdateUserDto {
	@ApiPropertyOptional({ description: '사용자 역할', enum: [...USER_ROLES], example: 'ADMIN' })
	@IsOptional()
	@IsEnum(USER_ROLES)
	role?: UserRole;

	@ApiPropertyOptional({ description: '가입 승인 여부', example: true })
	@IsOptional()
	@IsBoolean()
	approved?: boolean;

	// 전달하면 기존 허용 목록을 통째로 교체한다. 빈 배열은 "아무 광고도 못 봄"이라는 유효한 값이다.
	@ApiPropertyOptional({ description: '볼 수 있는 광고 id 목록(전달 시 통째 교체, 빈 배열이면 아무것도 안 보임)', type: [Number], example: [1, 2] })
	@IsOptional()
	@IsArray()
	@Type(() => Number)
	@IsInt({ each: true })
	advertising_ids?: number[];
}
