// campaign 이벤트 매핑(config) 조회·교체를 처리하는 컨트롤러
import { Body, Controller, Get, Param, ParseArrayPipe, Patch, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListConfigUseCase } from '@config/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@config/application/replace-config.use-case';
import { CampaignIdDto } from '@config/application/dto/campaign-id.dto';
import { ReplaceConfigDto } from '@config/application/dto/replace-config.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { ConfigResponse } from '@config/presentation/dto/config.response.dto';

@ApiTags('config')
@Controller('config')
@UseInterceptors(ResponseInterceptor)
export class ConfigController {
	constructor(
		private readonly listConfigUseCase: ListConfigUseCase,
		private readonly replaceConfigUseCase: ReplaceConfigUseCase
	) {}

	@Get(':campaignId')
	@ApiOperation({ summary: 'campaign 이벤트 매핑 목록 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: ConfigResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async list(@Param() param: CampaignIdDto) {
		return this.listConfigUseCase.execute(param.campaignId);
	}

	@Patch(':campaignId')
	@ApiOperation({ summary: 'campaign 이벤트 매핑 전체 교체' })
	@ApiBody({ type: [ReplaceConfigDto] })
	@ApiWrappedResponse({ status: 200, description: '교체 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'campaign 없음' })
	async replace(@Param() param: CampaignIdDto, @Body(new ParseArrayPipe({ items: ReplaceConfigDto })) body: ReplaceConfigDto[]): Promise<void> {
		await this.replaceConfigUseCase.execute(param.campaignId, body);
	}
}
