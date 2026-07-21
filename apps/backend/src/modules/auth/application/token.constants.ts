// JWT 만료 상수·refresh token Redis 키·payload 타입 공유 상수
import { UserRole } from '@user/domain/user.entity';

export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';
export const REFRESH_TOKEN_TTL = 1000 * 60 * 60 * 24 * 7; // 7일 — JWT 만료와 동일 (CachePort TTL은 밀리초)

export const refreshTokenKey = (userId: number) => `refresh:${userId}`;

export interface AccessTokenPayload {
	sub: number;
	email: string;
	role: UserRole;
}

export interface RefreshTokenPayload {
	sub: number;
}
