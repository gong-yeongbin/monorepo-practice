import { Expose } from 'class-transformer';
import { Role } from '@user/enum';

export class CreateUserDto {
	@Expose({ name: 'userId' })
	user_id: string;

	@Expose()
	password: string;

	@Expose()
	salt: string;

	@Expose()
	role: Role;
}
