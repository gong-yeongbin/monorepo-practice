import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { IUser } from '@user/domain/repositories';
import { User } from '@user/domain/entities';
import { CreateUserDto } from '@user/dto';

@Injectable()
export class UserRepository implements IUser {
	constructor(private readonly prismaService: PrismaService) {}

	async find(userId: string): Promise<User | null> {
		try {
			return await this.prismaService.user.findUnique({ where: { user_id: userId } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(user: CreateUserDto): Promise<User> {
		try {
			return await this.prismaService.user.create({ data: user });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
