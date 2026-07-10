// user 도메인 타입(DB 컬럼과 동일한 snake_case)
export type UserRole = 'ADMIN' | 'ADVERTISER' | 'MEDIA';

export interface User {
	id: number;
	user_id: string;
	password: string;
	role: UserRole;
}
