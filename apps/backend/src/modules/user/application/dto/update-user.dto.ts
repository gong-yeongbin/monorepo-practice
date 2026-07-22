import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@user/domain/user.entity';

// email은 불변. role·approved(승인 여부)만 선택적으로 부분 수정한다.
export class UpdateUserDto {
	@ApiPropertyOptional({ description: '사용자 역할', enum: ['ADMIN', 'ADVERTISER', 'MEDIA', 'DEVELOPER'], example: 'ADVERTISER' })
	@IsOptional()
	@IsEnum(['ADMIN', 'ADVERTISER', 'MEDIA', 'DEVELOPER'])
	role?: UserRole;

	@ApiPropertyOptional({ description: '가입 승인 여부', example: true })
	@IsOptional()
	@IsBoolean()
	approved?: boolean;
}
