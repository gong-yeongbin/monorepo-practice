// advertiser CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { GetAdvertiserUseCase } from '@advertiser/application/get-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { UpdateAdvertiserUseCase } from '@advertiser/application/update-advertiser.use-case';
import { DeleteAdvertiserUseCase } from '@advertiser/application/delete-advertiser.use-case';
import { CreateAdvertiserDto } from '@advertiser/application/dto/create-advertiser.dto';
import { AdvertiserIdDto } from '@advertiser/application/dto/advertiser-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { AdvertiserResponse } from '@advertiser/presentation/dto/advertiser.response.dto';

@ApiTags('advertiser')
@Controller('advertiser')
@UseInterceptors(ResponseInterceptor)
export class AdvertiserController {
	constructor(
		private readonly listAdvertiserUseCase: ListAdvertiserUseCase,
		private readonly getAdvertiserUseCase: GetAdvertiserUseCase,
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly updateAdvertiserUseCase: UpdateAdvertiserUseCase,
		private readonly deleteAdvertiserUseCase: DeleteAdvertiserUseCase
	) {}

	@Get()
	@ApiOperation({ summary: 'advertiser 목록 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: AdvertiserResponse, isArray: true })
	async list() {
		return this.listAdvertiserUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'advertiser 단건 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: AdvertiserResponse })
	@ApiResponse({ status: 404, description: 'advertiser 없음' })
	async get(@Param() param: AdvertiserIdDto) {
		return this.getAdvertiserUseCase.execute(param.id);
	}

	// admin 원본은 @Put + @Query였으나(주석에 Put->Post 의도 명시) REST 표준대로 POST + body로 이관한다.
	@Post()
	@ApiOperation({ summary: 'advertiser 생성' })
	@ApiWrappedResponse({ status: 201, description: '생성 성공', type: AdvertiserResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 409, description: '이미 존재하는 advertiser 이름' })
	async create(@Body() body: CreateAdvertiserDto) {
		return this.createAdvertiserUseCase.execute(body);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'advertiser 수정' })
	@ApiWrappedResponse({ status: 200, description: '수정 성공', type: AdvertiserResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'advertiser 없음' })
	@ApiResponse({ status: 409, description: '이미 존재하는 advertiser 이름' })
	async update(@Param() param: AdvertiserIdDto, @Body() body: CreateAdvertiserDto) {
		return this.updateAdvertiserUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'advertiser 삭제' })
	@ApiWrappedResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: 'advertiser 없음' })
	@ApiResponse({ status: 409, description: 'advertising에서 참조 중이라 삭제 불가' })
	async delete(@Param() param: AdvertiserIdDto): Promise<void> {
		await this.deleteAdvertiserUseCase.execute(param.id);
	}
}
