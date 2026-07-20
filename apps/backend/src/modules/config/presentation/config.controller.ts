// campaign 이벤트 매핑(config) 조회·교체를 처리하는 컨트롤러
import { Body, Controller, Get, Param, ParseArrayPipe, Patch, UseInterceptors } from '@nestjs/common';
import { ListConfigUseCase } from '@config/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@config/application/replace-config.use-case';
import { CampaignIdDto } from '@config/application/dto/campaign-id.dto';
import { ReplaceConfigDto } from '@config/application/dto/replace-config.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('config')
@UseInterceptors(ResponseInterceptor)
export class ConfigController {
	constructor(
		private readonly listConfigUseCase: ListConfigUseCase,
		private readonly replaceConfigUseCase: ReplaceConfigUseCase
	) {}

	@Get(':campaignId')
	async list(@Param() param: CampaignIdDto) {
		return this.listConfigUseCase.execute(param.campaignId);
	}

	@Patch(':campaignId')
	async replace(@Param() param: CampaignIdDto, @Body(new ParseArrayPipe({ items: ReplaceConfigDto })) body: ReplaceConfigDto[]): Promise<void> {
		await this.replaceConfigUseCase.execute(param.campaignId, body);
	}
}
