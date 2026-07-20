export const CACHE_PORT = Symbol('CACHE_PORT');

export interface CachePort {
	set(key: string, value: string, ttl: number): Promise<void>;
	get(key: string): Promise<string | null | undefined>;
	del(key: string): Promise<void>;
}
