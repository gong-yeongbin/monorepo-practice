import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateMediaDto, UpdateMediaDto } from '../dto/request';
import { CreateMediaUseCase, UpdateMediaUseCase } from '../use-case';
import { AccessTokenValidatorGuard } from '@common/guard';
import { MediaIdDto } from '@module/media/dto/media-id.dto';

@Controller('media')
@UseGuards(AccessTokenValidatorGuard)
export class MediaController {
	constructor(
		private readonly createMediaUseCase: CreateMediaUseCase,
		private readonly updateMediaUseCase: UpdateMediaUseCase
	) {}

	@Post()
	async create(@Body() body: CreateMediaDto) {
		return await this.createMediaUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: MediaIdDto, @Body() body: UpdateMediaDto) {
		return await this.updateMediaUseCase.execute(parseInt(param.id), body);
	}
}
