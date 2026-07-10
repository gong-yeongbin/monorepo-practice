import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Postback } from '@postback/domain/postback.entity';
import { PostbackRepository } from '@postback/domain/postback.repository';

@Injectable()
export class PrismaPostbackRepository implements PostbackRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(postbacks: Postback[]): Promise<void> {
		await this.prismaService.postback.createMany({ data: postbacks });
	}
}
