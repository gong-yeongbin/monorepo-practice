// 가입 대기 정보(비밀번호 해시·인증 코드)의 Redis 키·TTL·타입 공유 상수
export const PENDING_SIGNUP_TTL = 1000 * 60 * 10; // 10분 (CachePort TTL은 밀리초)

export const pendingSignupKey = (email: string) => `signup:${email}`;

// Redis에 JSON 문자열로 저장되는 가입 대기 정보
export interface PendingSignup {
	password: string; // bcrypt 해시
	code: string;
}
