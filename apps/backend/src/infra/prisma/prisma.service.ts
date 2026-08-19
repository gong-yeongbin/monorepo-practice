// Prisma 클라이언트의 연결 수명주기를 관리하는 서비스
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// mariadb 드라이버는 URL query의 connectionLimit을 pool 옵션으로 흡수한다.
// DATABASE_URL 자체는 prisma CLI(migrate)와 공유하므로 건드리지 않고 런타임에만 덧붙인다.
export function withConnectionLimit(url: string, limit?: string): string {
	if (!limit || !Number(limit)) return url;
	return `${url}${url.includes('?') ? '&' : '?'}connectionLimit=${Number(limit)}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// Prisma 7: 직접 연결은 driver adapter가 필요하다. DATABASE_URL 기반 MySQL/MariaDB 어댑터.
	constructor() {
		super({ adapter: new PrismaMariaDb(withConnectionLimit(process.env.DATABASE_URL as string, process.env.DB_CONNECTION_LIMIT)) });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
