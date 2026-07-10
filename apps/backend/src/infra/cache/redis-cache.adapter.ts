import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CachePort } from '@infra/cache/cache.port';
import { REDIS_CACHE_CLIENT } from '@infra/cache/cache.constants';

@Injectable()
export class RedisCacheAdapter implements CachePort {
	constructor(@Inject(REDIS_CACHE_CLIENT) private readonly redis: Redis) {}

	async set(key: string, value: string, ttl: number) {
		// TTL은 밀리초 단위이므로 PX 옵션을 사용한다
		await this.redis.set(key, value, 'PX', ttl);
	}

	async get(key: string) {
		return await this.redis.get(key);
	}
}
