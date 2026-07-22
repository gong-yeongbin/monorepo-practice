// media CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListMediaUseCase } from '@media/application/list-media.use-case';
import { GetMediaUseCase } from '@media/application/get-media.use-case';
import { CreateMediaUseCase } from '@media/application/create-media.use-case';
import { UpdateMediaUseCase } from '@media/application/update-media.use-case';
import { DeleteMediaUseCase } from '@media/application/delete-media.use-case';
import { CreateMediaDto } from '@media/application/dto/create-media.dto';
import { UpdateMediaDto } from '@media/application/dto/update-media.dto';
import { MediaIdDto } from '@media/application/dto/media-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@ApiTags('media')
@Controller('media')
@UseInterceptors(ResponseInterceptor)
export class MediaController {
	constructor(
		private readonly listMediaUseCase: ListMediaUseCase,
		private readonly getMediaUseCase: GetMediaUseCase,
		private readonly createMediaUseCase: CreateMediaUseCase,
		private readonly updateMediaUseCase: UpdateMediaUseCase,
		private readonly deleteMediaUseCase: DeleteMediaUseCase
	) {}

	@Get()
	@ApiOperation({ summary: 'media 목록 조회' })
	async list() {
		return this.listMediaUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'media 단건 조회' })
	async get(@Param() param: MediaIdDto) {
		return this.getMediaUseCase.execute(param.id);
	}

	@Post()
	@ApiOperation({ summary: 'media 생성' })
	async create(@Body() body: CreateMediaDto) {
		return this.createMediaUseCase.execute(body);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'media 수정 (전체 교체)' })
	async update(@Param() param: MediaIdDto, @Body() body: UpdateMediaDto) {
		return this.updateMediaUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'media 삭제' })
	async delete(@Param() param: MediaIdDto): Promise<void> {
		await this.deleteMediaUseCase.execute(param.id);
	}
}
