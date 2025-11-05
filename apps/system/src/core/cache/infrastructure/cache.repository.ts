import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ICache } from '@src/core/cache/domain/repositories';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheRepository implements ICache {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	async set(key: string, value: string, ttl: number) {
		await this.cache.set(key, value, ttl);
	}
	async get(key: string) {
		return await this.cache.get(key);
	}
}
