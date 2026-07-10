// Prisma로 캠페인을 조회하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Campaign } from '@postback/domain/campaign.entity';
import { CampaignRepository } from '@postback/domain/campaign.repository';

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByToken(token: string): Promise<Campaign | null> {
		return this.prismaService.campaign.findUnique({ where: { token }, include: { campaign_config: true } });
	}
}
