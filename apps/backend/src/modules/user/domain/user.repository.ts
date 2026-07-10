// user 조회·생성 repository 인터페이스와 DI 토큰
import { User, UserRole } from '@user/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserProps {
	user_id: string;
	password: string;
	role: UserRole;
}

export interface UserRepository {
	findByUserId(user_id: string): Promise<User | null>;
	create(props: CreateUserProps): Promise<void>;
}
