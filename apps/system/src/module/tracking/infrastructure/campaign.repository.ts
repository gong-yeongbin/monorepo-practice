import { ICampaign } from '@tracking/domain/repositories';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Campaign } from '../domain/entities';
import { PrismaService } from '@repo/prisma';

@Injectable()
export class CampaignRepository implements ICampaign {
	constructor(private readonly prismaService: PrismaService) {}

	async find(token: string): Promise<Campaign | null> {
		try {
			return await this.prismaService.campaign.findUnique({ where: { token }, include: {} });
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}
}
