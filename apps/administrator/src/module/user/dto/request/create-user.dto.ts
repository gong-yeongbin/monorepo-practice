import { IsEnum, IsString } from 'class-validator';
import { Role } from '@module/user/enum';

export class CreateUserDto {
	@IsString()
	userId: string;

	@IsString()
	password: string;

	@IsEnum(Role)
	role: Role;
}
