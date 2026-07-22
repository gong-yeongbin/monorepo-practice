// advertising CRUD와 통계 조회를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { GetAdvertisingUseCase } from '@advertising/application/get-advertising.use-case';
import { UpdateAdvertisingUseCase } from '@advertising/application/update-advertising.use-case';
import { DeleteAdvertisingUseCase } from '@advertising/application/delete-advertising.use-case';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';
import { UpdateAdvertisingDto } from '@advertising/application/dto/update-advertising.dto';
import { ListAdvertisingDto } from '@advertising/application/dto/list-advertising.dto';
import { AdvertisingIdDto } from '@advertising/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { AdvertisingInfoResponse, AdvertisingListItemResponse, AdvertisingResponse } from '@advertising/presentation/dto/advertising.response.dto';

@ApiTags('advertising')
@Controller('advertising')
@UseInterceptors(ResponseInterceptor)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly listAdvertisingUseCase: ListAdvertisingUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly deleteAdvertisingUseCase: DeleteAdvertisingUseCase
	) {}

	// admin 원본은 @Put이었으나 REST 표준대로 POST로 이관한다.
	@Post()
	@ApiOperation({ summary: 'advertising 생성' })
	@ApiWrappedResponse({ status: 201, description: '생성 성공', type: AdvertisingResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'tracker 또는 advertiser 없음' })
	@ApiResponse({ status: 409, description: '이미 존재하는 advertising 이름' })
	async create(@Body() body: CreateAdvertisingDto) {
		return this.createAdvertisingUseCase.execute(body);
	}

	@Get()
	@ApiOperation({ summary: 'advertising 목록 조회 (search·offset·limit)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: AdvertisingListItemResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async list(@Query() query: ListAdvertisingDto) {
		return this.listAdvertisingUseCase.execute(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'advertising 단건 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: AdvertisingInfoResponse })
	@ApiResponse({ status: 404, description: 'advertising 없음' })
	async get(@Param() param: AdvertisingIdDto) {
		return this.getAdvertisingUseCase.execute(param.id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'advertising 수정 (전체 교체)' })
	@ApiWrappedResponse({ status: 200, description: '수정 성공', type: AdvertisingResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'advertising·tracker·advertiser 중 하나 없음' })
	@ApiResponse({ status: 409, description: '이미 존재하는 advertising 이름' })
	async update(@Param() param: AdvertisingIdDto, @Body() body: UpdateAdvertisingDto) {
		return this.updateAdvertisingUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'advertising 삭제' })
	@ApiWrappedResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: 'advertising 없음' })
	@ApiResponse({ status: 409, description: 'campaign에서 참조 중이라 삭제 불가' })
	async delete(@Param() param: AdvertisingIdDto): Promise<void> {
		await this.deleteAdvertisingUseCase.execute(param.id);
	}
}
