import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateCampaignDto } from '@module/campaign/dto/request/create-campaign.dto';
import { CreateCampaignUseCase, GetCampaignUseCase, UpdateCampaignConfigUseCase } from '@module/campaign/use-case';
import { CampaignIdDto } from '@module/campaign/dto/campaign-id.dto';
import { AccessTokenValidatorGuard } from '@common/guard';
import { UpdateCampaignConfigDto } from '@module/campaign/dto/request';

@Controller('campaign')
@UseGuards(AccessTokenValidatorGuard)
export class CampaignController {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly updateCampaignConfigUseCase: UpdateCampaignConfigUseCase
	) {}

	@Post()
	async create(@Body() body: CreateCampaignDto) {
		return await this.createCampaignUseCase.execute(body);
	}

	@Get(':id')
	async get(@Param() param: CampaignIdDto) {
		return await this.getCampaignUseCase.execute(parseInt(param.id));
	}

	@Patch(':id')
	async patch(@Param() param: CampaignIdDto, @Body() body: UpdateCampaignConfigDto[]) {
		return await this.updateCampaignConfigUseCase.execute(parseInt(param.id), body);
	}
}
