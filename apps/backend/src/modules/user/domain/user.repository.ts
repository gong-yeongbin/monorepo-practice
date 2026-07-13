// user 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { User, UserRole } from '@user/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserProps {
	user_id: string;
	password: string;
	role: UserRole;
}

// user_id(로그인 식별자)는 불변. password·role만 부분 수정한다.
export interface UpdateUserProps {
	password?: string;
	role?: UserRole;
}

export interface UserRepository {
	findAll(): Promise<User[]>;
	findById(id: number): Promise<User | null>;
	findByUserId(user_id: string): Promise<User | null>;
	create(props: CreateUserProps): Promise<void>;
	update(id: number, props: UpdateUserProps): Promise<User>;
	delete(id: number): Promise<void>;
}
