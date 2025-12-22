import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IPostback } from '@postback/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { PostbackDto } from '@postback/dto';
import { Postback } from '@postback/domain/entities';

@Injectable()
export class PostbackRepository implements IPostback {
	constructor(private readonly prismaService: PrismaService) {}

	async create(postback: PostbackDto): Promise<Postback> {
		try {
			return await this.prismaService.postback.create({ data: postback });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
