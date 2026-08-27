// Prisma 클라이언트의 연결 수명주기를 관리하는 서비스
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// DB_CONNECTION_LIMIT을 pg Pool의 max 옵션으로 변환한다.
// DATABASE_URL 자체는 prisma CLI(migrate)와 공유하므로 건드리지 않고 런타임 풀 옵션으로만 반영한다.
export function poolConfig(url: string, limit?: string): { connectionString: string; max?: number } {
	if (!limit || !Number(limit)) return { connectionString: url };
	return { connectionString: url, max: Number(limit) };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// Prisma 7: 직접 연결은 driver adapter가 필요하다. DATABASE_URL 기반 PostgreSQL 어댑터.
	constructor() {
		super({ adapter: new PrismaPg(poolConfig(process.env.DATABASE_URL as string, process.env.DB_CONNECTION_LIMIT)) });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
