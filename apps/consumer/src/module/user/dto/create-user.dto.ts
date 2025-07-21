import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../shared/enum';

export class CreateUserDto {
	@IsString()
	user_id: string;

	@IsString()
	password: string;

	@IsEnum(UserRole)
	role: string;
}
