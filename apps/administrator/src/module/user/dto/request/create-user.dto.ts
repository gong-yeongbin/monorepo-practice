import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '@module/user/shared/enum';

export class CreateUserDto {
	@IsString()
	userId: string;

	@IsString()
	password: string;

	@IsEnum(UserRole)
	role: string;
}
