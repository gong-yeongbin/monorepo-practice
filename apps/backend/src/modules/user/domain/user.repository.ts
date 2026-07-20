// user 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { User, UserRole } from '@user/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// role·approved는 DB 기본값(ADMIN·false)을 쓴다.
export interface CreateUserProps {
	email: string;
}

// email은 불변. role·approved만 부분 수정한다.
export interface UpdateUserProps {
	role?: UserRole;
	approved?: boolean;
}

export interface UserRepository {
	findAll(): Promise<User[]>;
	findById(id: number): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(props: CreateUserProps): Promise<void>;
	update(id: number, props: UpdateUserProps): Promise<User>;
	delete(id: number): Promise<void>;
}
