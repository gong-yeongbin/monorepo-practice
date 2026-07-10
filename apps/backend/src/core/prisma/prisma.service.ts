// Prisma 클라이언트의 연결 수명주기를 관리하는 서비스
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// Prisma 7: 직접 연결은 driver adapter가 필요하다. DATABASE_URL 기반 MySQL/MariaDB 어댑터.
	constructor() {
		super({ adapter: new PrismaMariaDb(process.env.DATABASE_URL as string) });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
