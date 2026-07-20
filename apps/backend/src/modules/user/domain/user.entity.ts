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
