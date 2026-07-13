// tracker CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';
import { GetTrackerUseCase } from '@tracker/application/get-tracker.use-case';
import { CreateTrackerUseCase } from '@tracker/application/create-tracker.use-case';
import { UpdateTrackerUseCase } from '@tracker/application/update-tracker.use-case';
import { DeleteTrackerUseCase } from '@tracker/application/delete-tracker.use-case';
import { CreateTrackerDto } from '@tracker/application/dto/create-tracker.dto';
import { UpdateTrackerDto } from '@tracker/application/dto/update-tracker.dto';
import { TrackerIdDto } from '@tracker/application/dto/tracker-id.dto';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('tracker')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class TrackerController {
	constructor(
		private readonly listTrackerUseCase: ListTrackerUseCase,
		private readonly getTrackerUseCase: GetTrackerUseCase,
		private readonly createTrackerUseCase: CreateTrackerUseCase,
		private readonly updateTrackerUseCase: UpdateTrackerUseCase,
		private readonly deleteTrackerUseCase: DeleteTrackerUseCase
	) {}

	@Get()
	async list() {
		return this.listTrackerUseCase.execute();
	}

	@Get(':id')
	async get(@Param() param: TrackerIdDto) {
		return this.getTrackerUseCase.execute(param.id);
	}

	@Post()
	async create(@Body() body: CreateTrackerDto) {
		return this.createTrackerUseCase.execute(body);
	}

	@Patch(':id')
	async update(@Param() param: TrackerIdDto, @Body() body: UpdateTrackerDto) {
		return this.updateTrackerUseCase.execute(param.id, body);
	}

	@Delete(':id')
	async delete(@Param() param: TrackerIdDto): Promise<void> {
		await this.deleteTrackerUseCase.execute(param.id);
	}
}
