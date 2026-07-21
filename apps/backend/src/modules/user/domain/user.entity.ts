// user 도메인 타입(DB 컬럼과 동일한 snake_case)
export type UserRole = 'ADMIN' | 'ADVERTISER' | 'MEDIA' | 'DEVELOPER';

export interface User {
	id: number;
	email: string;
	role: UserRole;
	approved: boolean;
	created_at: Date;
	updated_at: Date;
	advertiser_id: number | null;
}

// signin 비밀번호 검증 전용. API 응답으로 반환 금지 — password는 bcrypt 해시.
export interface UserWithPassword extends User {
	password: string;
}
