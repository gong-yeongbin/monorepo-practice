import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@user/domain/user.entity';

// user_id(로그인 식별자)는 불변. password·role만 선택적으로 부분 수정한다.
export class UpdateUserDto {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	password?: string;

	@IsOptional()
	@IsEnum(['ADMIN', 'ADVERTISER', 'MEDIA'])
	role?: UserRole;
}
