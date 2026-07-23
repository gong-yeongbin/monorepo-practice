// campaign CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { UpdateCampaignUseCase } from '@campaign/application/update-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListCampaignUseCase } from '@campaign/application/list-campaign.use-case';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';
import { CampaignIdDto } from '@campaign/application/dto/campaign-id.dto';
import { ListCampaignDto } from '@campaign/application/dto/list-campaign.dto';
import { UpdateCampaignDto } from '@campaign/application/dto/update-campaign.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { CampaignListItemResponse, CampaignResponse } from '@campaign/presentation/dto/campaign.response.dto';

@ApiTags('campaigns')
@Controller('campaigns')
@UseInterceptors(ResponseInterceptor)
export class CampaignController {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly deleteCampaignUseCase: DeleteCampaignUseCase,
		private readonly updateCampaignUseCase: UpdateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly listCampaignUseCase: ListCampaignUseCase
	) {}

	// admin 원본은 @Put이었으나 REST 표준대로 POST로 이관한다.
	@Post()
	@ApiOperation({ summary: 'campaign 생성' })
	@ApiWrappedResponse({ status: 201, description: '생성 성공', type: CampaignResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'advertising 또는 media 없음' })
	async create(@Body() body: CreateCampaignDto) {
		return this.createCampaignUseCase.execute(body);
	}

	// admin 원본은 GET /advertising/campaign/:id였으나 campaign 리소스 목록이라 여기로 이관한다.
	@Get()
	@ApiOperation({ summary: 'campaign 목록 조회 (advertising 단위 필터)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: CampaignListItemResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async list(@Query() query: ListCampaignDto) {
		return this.listCampaignUseCase.execute(query.advertisingId);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'campaign 삭제' })
	@ApiWrappedResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: 'campaign 없음' })
	async delete(@Param() param: CampaignIdDto): Promise<void> {
		await this.deleteCampaignUseCase.execute(param.id);
	}

	// admin 원본은 status 토글이었으나 정보 수정(name·type·media_id·is_active 부분 수정)으로 통합한다.
	@Patch(':id')
	@ApiOperation({ summary: 'campaign 수정 (name·type·media_id·is_active 부분 수정)' })
	@ApiWrappedResponse({ status: 200, description: '수정 성공', type: CampaignResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'campaign 또는 media 없음' })
	async update(@Param() param: CampaignIdDto, @Body() body: UpdateCampaignDto) {
		return this.updateCampaignUseCase.execute(param.id, body);
	}

	@Get(':id')
	@ApiOperation({ summary: 'campaign 단건 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: CampaignResponse })
	@ApiResponse({ status: 404, description: 'campaign 없음' })
	async get(@Param() param: CampaignIdDto) {
		return this.getCampaignUseCase.execute(param.id);
	}
}
