import { Body, Controller, Post } from '@nestjs/common';
import { CreateCampaignDto } from '@module/campaign/dto/request/create-campaign.dto';
import { CreateCampaignUseCase } from '@module/campaign/use-case';

@Controller('campaign')
export class CampaignController {
	constructor(private readonly createCampaignUseCase: CreateCampaignUseCase) {}

	@Post()
	async create(@Body() body: CreateCampaignDto) {
		return await this.createCampaignUseCase.execute(body);
	}
}
