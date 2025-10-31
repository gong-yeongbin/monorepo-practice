import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateCampaignDto } from '@module/campaign/dto/request/create-campaign.dto';
import { CreateCampaignUseCase, GetCampaignListUseCase, GetCampaignUseCase } from '@module/campaign/use-case';
import { CampaignIdDto } from '@module/campaign/dto/campaign-id.dto';
import { AdvertisingIdDto } from '@module/advertising/dto/advertising-id.dto';
import { AccessTokenValidatorGuard } from '@common/guard';

@Controller('campaign')
@UseGuards(AccessTokenValidatorGuard)
export class CampaignController {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly getCampaignListUseCase: GetCampaignListUseCase
	) {}

	@Post()
	async create(@Body() body: CreateCampaignDto) {
		return await this.createCampaignUseCase.execute(body);
	}

	@Get(':id')
	async get(@Param() param: CampaignIdDto) {
		return await this.getCampaignUseCase.execute(parseInt(param.id));
	}

	@Get(':id/list')
	async list(@Param() param: AdvertisingIdDto) {
		return await this.getCampaignListUseCase.execute(parseInt(param.id));
	}
}
