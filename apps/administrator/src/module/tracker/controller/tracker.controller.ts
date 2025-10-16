import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AccessTokenValidatorGuard } from '../../../common/guard';
import { CreateTrackerDto, UpdateTrackerDto } from '../dto/request';
import { CreateTrackerUseCase, UpdateTrackerUseCase } from '../use-case';
import { TrackerIdDto } from '../shared/dto';

@UseGuards(AccessTokenValidatorGuard)
@Controller('tracker')
export class TrackerController {
	constructor(
		private readonly createTrackerUseCase: CreateTrackerUseCase,
		private readonly updateTrackerUseCase: UpdateTrackerUseCase
	) {}

	@Post()
	async create(@Body() body: CreateTrackerDto) {
		return await this.createTrackerUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: TrackerIdDto, @Body() body: UpdateTrackerDto) {
		return await this.updateTrackerUseCase.execute(parseInt(param.id), body);
	}
}
