export interface ICache {
	set(key: string, value: string, ttl: number): Promise<void>;
	get(key: string): Promise<any>;
}
