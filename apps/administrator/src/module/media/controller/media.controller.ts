import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateMediaDto, UpdateMediaDto } from '../dto/request';
import { CreateMediaUseCase, UpdateMediaUseCase } from '../use-case';
import { MediaIdDto } from '../shared/dto';
import { AccessTokenValidatorGuard } from '@common/guard';

@UseGuards(AccessTokenValidatorGuard)
@Controller('media')
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
