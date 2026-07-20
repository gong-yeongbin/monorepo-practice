// Prisma로 user를 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { User } from '@user/domain/user.entity';
import { CreateUserProps, UpdateUserProps, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// 조회·수정 결과는 password를 omit해 반환한다(도메인 User 타입에 없고 API 응답에 해시가 노출되면 안 됨)
	async findAll(): Promise<User[]> {
		return this.prismaService.user.findMany({ omit: { password: true } });
	}

	async findById(id: number): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { id }, omit: { password: true } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { email }, omit: { password: true } });
	}

	async create(props: CreateUserProps): Promise<void> {
		await this.prismaService.user.create({ data: props });
	}

	async update(id: number, props: UpdateUserProps): Promise<User> {
		return this.prismaService.user.update({ where: { id }, data: props, omit: { password: true } });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.user.delete({ where: { id } });
	}
}
