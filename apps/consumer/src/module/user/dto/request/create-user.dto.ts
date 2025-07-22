import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../shared/enum';

export class CreateUserDto {
	@IsString()
	userId: string;

	@IsString()
	password: string;

	@IsEnum(UserRole)
	role: string;
}
