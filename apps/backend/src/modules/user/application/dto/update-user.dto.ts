import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@user/domain/user.entity';

// email은 불변. role·approved(승인 여부)만 선택적으로 부분 수정한다.
export class UpdateUserDto {
	@IsOptional()
	@IsEnum(['ADMIN', 'ADVERTISER', 'MEDIA', 'DEVELOPER'])
	role?: UserRole;

	@IsOptional()
	@IsBoolean()
	approved?: boolean;
}
