// Prisma로 user를 조회·생성하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { User } from '@user/domain/user.entity';
import { CreateUserProps, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByUserId(user_id: string): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { user_id } });
	}

	async create(props: CreateUserProps): Promise<void> {
		await this.prismaService.user.create({ data: props });
	}
}
