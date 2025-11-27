import { IsEnum, IsString } from 'class-validator';
import { Role } from '@module/user/enum';
import { Transform } from 'class-transformer';

export class CreateUserDto {
	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	userId: string;

	@IsString()
	password: string;

	@IsEnum(Role)
	role: Role;
}
