import { UserDto } from '@module/user/dto/user.dto';
import { User } from '@module/user/domain/user.entity';

export interface IUser {
	find(userId: string): Promise<User | null>;
	create(user: UserDto): Promise<User>;
}
