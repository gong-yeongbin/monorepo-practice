// user 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { User, UserRole, UserWithPassword } from '@user/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// role·approved는 DB 기본값(ADMIN·false)을 쓴다. password는 bcrypt 해시 — 도메인 User 타입에 노출하지 않고 signin 검증 시에만 findByEmailWithPassword로 읽는다.
export interface CreateUserProps {
	email: string;
	password: string;
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
	findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
	create(props: CreateUserProps): Promise<void>;
	update(id: number, props: UpdateUserProps): Promise<User>;
	delete(id: number): Promise<void>;
}
