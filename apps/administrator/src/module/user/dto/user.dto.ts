import { Expose } from 'class-transformer';
import { Role } from '@module/user/enum';

export class UserDto {
	@Expose({ name: 'userId' })
	user_id: string;

	@Expose()
	password: string;

	@Expose()
	salt: string;

	@Expose()
	role: Role;
}
