import { User } from '@user/domain/entities';
import { CreateUserDto } from '@user/dto';

export interface IUser {
	find(userId: string): Promise<User | null>;
	create(user: CreateUserDto): Promise<User>;
}
