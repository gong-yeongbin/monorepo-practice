import { User } from '@module/user/domain/entities';
import { CreateUserDto } from '@module/user/dto';

export interface IUser {
	find(userId: string): Promise<User | null>;
	create(user: CreateUserDto): Promise<User>;
}
