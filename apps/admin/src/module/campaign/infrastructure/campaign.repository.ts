import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICampaign } from '@module/campaign/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { Campaign } from '@campaign/domain/entities';
import { CampaignDto } from '@campaign/dto/campaign.dto';

@Injectable()
export class CampaignRepository implements ICampaign {
	constructor(private readonly prismaService: PrismaService) {}

	async find(id: number): Promise<Campaign | null> {
		try {
			return await this.prismaService.campaign.findUnique({ where: { id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findMany(baseDate: Date): Promise<Campaign[]> {
		try {
			return await this.prismaService.campaign.findMany({ where: { is_active: true } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(campaign: CampaignDto): Promise<Campaign> {
		try {
			return await this.prismaService.$transaction(async (prisma) => {
				const result = await prisma.campaign.create({ data: campaign });
				await prisma.campaign_config.create({ data: { token: result.token } });
				return result;
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
