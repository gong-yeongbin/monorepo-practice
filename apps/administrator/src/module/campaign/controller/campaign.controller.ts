import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCampaignDto } from '@module/campaign/dto/request/create-campaign.dto';
import { CreateCampaignUseCase } from '@module/campaign/use-case';
import { CampaignIdDto } from '@module/campaign/dto/campaign-id.dto';
import { GetCampaignUseCase } from '@module/campaign/use-case/get-campaign.use-case';

@Controller('campaign')
export class CampaignController {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase
	) {}

	@Post()
	async create(@Body() body: CreateCampaignDto) {
		return await this.createCampaignUseCase.execute(body);
	}

	@Get(':id')
	async get(@Param() param: CampaignIdDto) {
		return await this.getCampaignUseCase.execute(parseInt(param.id));
	}
}
