// user 도메인 타입(DB 컬럼과 동일한 snake_case)
// Role 값의 단일 출처 — DTO의 @IsEnum·Swagger enum도 이 배열을 재사용한다(domain은 Prisma를 모르므로 Prisma enum은 쓰지 않는다)
export const USER_ROLES = ['DEVELOPER', 'ADMIN', 'USER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

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
