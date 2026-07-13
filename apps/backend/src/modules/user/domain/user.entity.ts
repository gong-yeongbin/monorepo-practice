// user 도메인 타입(DB 컬럼과 동일한 snake_case)
export type UserRole = 'ADMIN' | 'ADVERTISER' | 'MEDIA';

export interface User {
	id: number;
	user_id: string;
	password: string;
	role: UserRole;
}

// 외부 노출용. password를 제외한다.
export type Profile = Omit<User, 'password'>;

// User에서 password를 제거해 외부 노출용 Profile로 변환한다.
export function toProfile(user: User): Profile {
	return { id: user.id, user_id: user.user_id, role: user.role };
}
