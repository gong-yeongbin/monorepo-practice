import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICampaign } from '@module/campaign/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { Campaign } from '../domain/entities';
import { CampaignDto } from '../dto/campaign.dto';

@Injectable()
export class CampaignRepository implements ICampaign {
	constructor(private readonly prismaService: PrismaService) {}

	async create(campaign: CampaignDto): Promise<Campaign> {
		try {
			return await this.prismaService.campaign.create({ data: campaign });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
