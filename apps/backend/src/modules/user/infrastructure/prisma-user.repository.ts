// Prisma로 user를 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { User } from '@user/domain/user.entity';
import { CreateUserProps, UpdateUserProps, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(): Promise<User[]> {
		return this.prismaService.user.findMany();
	}

	async findById(id: number): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { id } });
	}

	async findByUserId(user_id: string): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { user_id } });
	}

	async create(props: CreateUserProps): Promise<void> {
		await this.prismaService.user.create({ data: props });
	}

	async update(id: number, props: UpdateUserProps): Promise<User> {
		return this.prismaService.user.update({ where: { id }, data: props });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.user.delete({ where: { id } });
	}
}
