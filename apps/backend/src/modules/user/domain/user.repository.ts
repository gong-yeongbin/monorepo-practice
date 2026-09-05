// user 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { User, UserRole, UserWithPassword } from '@user/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// role·approved는 DB 기본값(USER·false)을 쓴다. password는 bcrypt 해시 — 도메인 User 타입에 노출하지 않고 signin 검증 시에만 findByEmailWithPassword로 읽는다.
export interface CreateUserProps {
	email: string;
	password: string;
}

// email은 불변. role·approved·advertising_ids만 부분 수정한다.
export interface UpdateUserProps {
	role?: UserRole;
	approved?: boolean;
	// 주면 허용 목록을 통째로 교체한다(부분 추가가 아니다). []는 "아무것도 못 봄"이라는 유효한 값이다.
	advertising_ids?: number[];
}

// 승인 여부 필터(생략 시 전체). 승인 대기 목록은 approved: false로 조회한다.
export interface FindAllUserFilter {
	approved?: boolean;
}

export interface UserRepository {
	findAll(filter?: FindAllUserFilter): Promise<User[]>;
	findById(id: number): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
	create(props: CreateUserProps): Promise<void>;
	update(id: number, props: UpdateUserProps): Promise<User>;
	// 비밀번호는 UpdateUserProps와 분리한다 — bcrypt 해시라 다른 필드와 함께 부분 수정할 값이 아니다(반환값도 쓰지 않는다)
	updatePassword(id: number, password: string): Promise<void>;
	delete(id: number): Promise<void>;
	// 지정한 id 중 실제로 존재하는 advertising 개수. 허용 목록 검증용이다.
	// user 모듈이 AdvertisingModule에 의존하면 AuthModule → UserModule 경로로 advertising 모듈이 끌려오므로
	// 존재 검증만 여기(infrastructure)에서 처리한다(PrismaAdvertisingRepository.advertiserExists와 같은 선례).
	countAdvertising(advertising_ids: number[]): Promise<number>;
}
