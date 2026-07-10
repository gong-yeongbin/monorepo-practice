import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '@user/domain/user.entity';

export class CreateUserDto {
	@IsNotEmpty()
	@IsString()
	user_id: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsEnum(['ADMIN', 'ADVERTISER', 'MEDIA'])
	role: UserRole;
}
