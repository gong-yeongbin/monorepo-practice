import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AccessTokenValidatorGuard } from '@src/common/guard';
import { CreateTrackerUseCase, GetTrackerListUseCase, UpdateTrackerUseCase } from '@module/tracker/use-case';
import { CreateTrackerDto, UpdateTrackerDto } from '@module/tracker/dto/request';
import { TrackerIdDto } from '@module/tracker/dto/tracker-id.dto';

@Controller('tracker')
// @UseGuards(AccessTokenValidatorGuard)
export class TrackerController {
	constructor(
		private readonly createTrackerUseCase: CreateTrackerUseCase,
		private readonly updateTrackerUseCase: UpdateTrackerUseCase,
		private readonly getTrackerListUseCase: GetTrackerListUseCase
	) {}

	@Get()
	async list() {
		return await this.getTrackerListUseCase.execute();
	}

	@Post()
	async create(@Body() body: CreateTrackerDto) {
		return await this.createTrackerUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: TrackerIdDto, @Body() body: UpdateTrackerDto) {
		return await this.updateTrackerUseCase.execute(parseInt(param.id), body);
	}
}
