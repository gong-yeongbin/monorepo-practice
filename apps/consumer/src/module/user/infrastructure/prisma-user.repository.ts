import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { User } from '@repo/prisma';
import { UserDto } from '../shared/dto';
import { UserRepository } from '../domain';

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async find(userId: string): Promise<User | null> {
		try {
			return await this.prismaService.user.findUnique({ where: { user_id: userId } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(user: UserDto): Promise<User> {
		try {
			return await this.prismaService.user.create({ data: user });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
