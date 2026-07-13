// Prisma로 campaign_config를 조회·교체하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { CampaignConfig } from '@config/domain/config.entity';
import { ConfigRepository, UpsertConfigProps } from '@config/domain/config.repository';

@Injectable()
export class PrismaConfigRepository implements ConfigRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async campaignExists(campaign_id: number): Promise<boolean> {
		const campaign = await this.prismaService.campaign.findUnique({ where: { id: campaign_id } });
		return campaign !== null;
	}

	async findByCampaignId(campaign_id: number): Promise<CampaignConfig[]> {
		return this.prismaService.campaign_config.findMany({ where: { campaign_id } });
	}

	async replace(campaign_id: number, configs: UpsertConfigProps[]): Promise<void> {
		await this.prismaService.$transaction([
			this.prismaService.campaign_config.deleteMany({ where: { campaign_id } }),
			this.prismaService.campaign_config.createMany({ data: configs.map((config) => ({ ...config, campaign_id })) }),
		]);
	}
}
