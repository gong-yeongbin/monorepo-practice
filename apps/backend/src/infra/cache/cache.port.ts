export const CACHE_PORT = Symbol('CACHE_PORT');

export interface CachePort {
	set(key: string, value: string, ttl: number): Promise<void>;
	// 키가 없을 때만 저장하고 성공 여부를 돌려준다 — 여러 프로세스 중 하나만 통과시키는 분산 락에 쓴다
	setIfAbsent(key: string, value: string, ttl: number): Promise<boolean>;
	get(key: string): Promise<string | null | undefined>;
	del(key: string): Promise<void>;
}
