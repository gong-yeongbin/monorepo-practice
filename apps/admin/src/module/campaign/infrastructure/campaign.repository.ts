import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { Campaign } from '@campaign/domain/entities';
import { CreateCampaignDto, UpdateCampaignDto } from '@campaign/dto';
import { ICampaign } from '@campaign/domain/repositories';

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

	async findMany(): Promise<Campaign[]> {
		try {
			return await this.prismaService.campaign.findMany({ where: { is_active: true } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(campaign: CreateCampaignDto): Promise<Campaign> {
		try {
			const { name, type, tracker_tracking_url, advertising_name, media_name } = campaign;

			return await this.prismaService.campaign.create({
				data: { name, type, tracker_tracking_url, advertising: { connect: { name: advertising_name } }, media: { connect: { name: media_name } }, campaign_config: { create: {} } },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(campaign: UpdateCampaignDto): Promise<Campaign> {
		try {
			const { id, name, type, tracker_tracking_url } = campaign;

			return await this.prismaService.campaign.update({
				where: { id },
				data: { name, type, tracker_tracking_url },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
