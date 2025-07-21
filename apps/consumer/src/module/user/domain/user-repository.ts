import { User } from '@repo/prisma';
import { UserDto } from '../shared/dto';

export abstract class UserRepository {
	abstract find(userId: string): Promise<User | null>;
	abstract create(user: UserDto): Promise<User>;
}
