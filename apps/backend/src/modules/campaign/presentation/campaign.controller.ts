// campaign CRUD와 이벤트 매핑(config) 조회·교체를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { ToggleCampaignUseCase } from '@campaign/application/toggle-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListConfigUseCase } from '@campaign/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@campaign/application/replace-config.use-case';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';
import { CampaignIdDto } from '@campaign/application/dto/campaign-id.dto';
import { ReplaceConfigDto } from '@campaign/application/dto/replace-config.dto';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('campaign')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class CampaignController {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly deleteCampaignUseCase: DeleteCampaignUseCase,
		private readonly toggleCampaignUseCase: ToggleCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly listConfigUseCase: ListConfigUseCase,
		private readonly replaceConfigUseCase: ReplaceConfigUseCase
	) {}

	// admin 원본은 @Put이었으나 REST 표준대로 POST로 이관한다.
	@Post()
	async create(@Body() body: CreateCampaignDto) {
		return this.createCampaignUseCase.execute(body);
	}

	@Delete(':id')
	async delete(@Param() param: CampaignIdDto): Promise<void> {
		await this.deleteCampaignUseCase.execute(param.id);
	}

	@Patch(':id')
	async toggle(@Param() param: CampaignIdDto): Promise<void> {
		await this.toggleCampaignUseCase.execute(param.id);
	}

	@Get(':id')
	async get(@Param() param: CampaignIdDto) {
		return this.getCampaignUseCase.execute(param.id);
	}

	@Get(':id/event')
	async getConfigs(@Param() param: CampaignIdDto) {
		return this.listConfigUseCase.execute(param.id);
	}

	@Patch(':id/event')
	async replaceConfigs(@Param() param: CampaignIdDto, @Body(new ParseArrayPipe({ items: ReplaceConfigDto })) body: ReplaceConfigDto[]): Promise<void> {
		await this.replaceConfigUseCase.execute(param.id, body);
	}
}
