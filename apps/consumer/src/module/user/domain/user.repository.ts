import { UserDto } from '../shared/dto';
import { User } from '@repo/prisma';

export abstract class UserRepository {
	abstract find(userId: string): Promise<User | null>;
	abstract create(user: UserDto): Promise<User>;
}
