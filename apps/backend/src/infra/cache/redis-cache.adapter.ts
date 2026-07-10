import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CachePort } from '@infra/cache/cache.port';

@Injectable()
export class RedisCacheAdapter implements CachePort {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	async set(key: string, value: string, ttl: number) {
		await this.cache.set(key, value, ttl);
	}

	async get(key: string) {
		return await this.cache.get<string>(key);
	}
}
