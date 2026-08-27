import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { USER_ROLES, UserRole } from '@user/domain/user.entity';

// email은 불변. role·approved(승인 여부)만 선택적으로 부분 수정한다.
export class UpdateUserDto {
	@ApiPropertyOptional({ description: '사용자 역할', enum: [...USER_ROLES], example: 'ADMIN' })
	@IsOptional()
	@IsEnum(USER_ROLES)
	role?: UserRole;

	@ApiPropertyOptional({ description: '가입 승인 여부', example: true })
	@IsOptional()
	@IsBoolean()
	approved?: boolean;
}
