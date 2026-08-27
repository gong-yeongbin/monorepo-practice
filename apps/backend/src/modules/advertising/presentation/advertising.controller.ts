// advertising CRUD와 통계 조회를 처리하는 컨트롤러
import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { GetAdvertisingUseCase } from '@advertising/application/get-advertising.use-case';
import { UpdateAdvertisingUseCase } from '@advertising/application/update-advertising.use-case';
import { DeleteAdvertisingUseCase } from '@advertising/application/delete-advertising.use-case';
import { UploadAdvertisingImageUseCase } from '@advertising/application/upload-advertising-image.use-case';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';
import { UpdateAdvertisingDto } from '@advertising/application/dto/update-advertising.dto';
import { ListAdvertisingDto } from '@advertising/application/dto/list-advertising.dto';
import { AdvertisingIdDto } from '@advertising/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { AdvertisingImageResponse, AdvertisingInfoResponse, AdvertisingListItemResponse, AdvertisingResponse } from '@advertising/presentation/dto/advertising.response.dto';
import { Roles } from '@auth/presentation/roles.decorator';
import { CurrentUser } from '@auth/presentation/current-user.decorator';
import { AccessTokenPayload } from '@auth/application/token.constants';
import { advertisingScopeOf } from '@auth/application/advertising-scope';

@ApiTags('advertising')
@Roles('DEVELOPER', 'ADMIN')
@Controller('advertising')
@UseInterceptors(ResponseInterceptor)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly listAdvertisingUseCase: ListAdvertisingUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly deleteAdvertisingUseCase: DeleteAdvertisingUseCase,
		private readonly uploadAdvertisingImageUseCase: UploadAdvertisingImageUseCase
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

	// 대시보드 상세 화면의 InfoCard가 호출하므로 USER에게도 연다(클래스 레벨 @Roles를 메서드 레벨이 덮는다).
	// 단 USER는 허용 광고 목록(user_advertising) 안의 광고만 볼 수 있고, 밖이면 404다.
	// 생성·수정·삭제·이미지 업로드는 클래스 기본값 그대로 ADMIN 이상이다.
	@Get(':id')
	@Roles('DEVELOPER', 'ADMIN', 'USER')
	@ApiOperation({ summary: 'advertising 단건 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: AdvertisingInfoResponse })
	@ApiResponse({ status: 404, description: 'advertising 없음 또는 허용 목록 밖' })
	async get(@Param() param: AdvertisingIdDto, @CurrentUser() user: AccessTokenPayload) {
		return this.getAdvertisingUseCase.execute(param.id, advertisingScopeOf(user));
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

	@Post(':id/image')
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'advertising 이미지 업로드 (S3 저장 후 URL 갱신, 매직 넘버 검증으로 SVG는 거부됨)' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] } })
	@ApiWrappedResponse({ status: 201, description: '업로드 성공', type: AdvertisingImageResponse })
	@ApiResponse({ status: 400, description: '파일 누락·5MB 초과·이미지 아님' })
	@ApiResponse({ status: 404, description: 'advertising 없음' })
	async uploadImage(
		@Param() param: AdvertisingIdDto,
		@UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), new FileTypeValidator({ fileType: /^image\// })] }))
		file: Express.Multer.File
	) {
		return this.uploadAdvertisingImageUseCase.execute(param.id, file);
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
