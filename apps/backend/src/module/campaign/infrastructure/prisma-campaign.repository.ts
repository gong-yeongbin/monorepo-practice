import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { Campaign } from '@campaign/domain/campaign.entity';
import { CampaignConfig } from '@campaign/domain/campaign-config.entity';
import { CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByToken(token: string): Promise<Campaign | null> {
		const row = await this.prismaService.campaign.findUnique({ where: { token }, include: { campaign_config: true } });
		if (!row) return null;

		return new Campaign({ ...row, campaign_config: row.campaign_config.map((config) => new CampaignConfig(config)) });
	}
}
