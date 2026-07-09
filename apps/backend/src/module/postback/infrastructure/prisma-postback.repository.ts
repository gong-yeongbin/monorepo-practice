import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { PostbackDto } from '@postback/application/dto/postback.dto';
import { PostbackRepository } from '@postback/application/port/postback.repository';

@Injectable()
export class PrismaPostbackRepository implements PostbackRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(postbacks: PostbackDto[]): Promise<void> {
		await this.prismaService.postback.createMany({ data: postbacks });
	}
}
