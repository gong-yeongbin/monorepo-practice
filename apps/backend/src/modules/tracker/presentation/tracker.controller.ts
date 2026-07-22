// tracker CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';
import { GetTrackerUseCase } from '@tracker/application/get-tracker.use-case';
import { CreateTrackerUseCase } from '@tracker/application/create-tracker.use-case';
import { UpdateTrackerUseCase } from '@tracker/application/update-tracker.use-case';
import { DeleteTrackerUseCase } from '@tracker/application/delete-tracker.use-case';
import { CreateTrackerDto } from '@tracker/application/dto/create-tracker.dto';
import { UpdateTrackerDto } from '@tracker/application/dto/update-tracker.dto';
import { TrackerIdDto } from '@tracker/application/dto/tracker-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@ApiTags('tracker')
@Controller('tracker')
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
	@ApiOperation({ summary: 'tracker 목록 조회' })
	async list() {
		return this.listTrackerUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'tracker 단건 조회' })
	async get(@Param() param: TrackerIdDto) {
		return this.getTrackerUseCase.execute(param.id);
	}

	@Post()
	@ApiOperation({ summary: 'tracker 생성' })
	async create(@Body() body: CreateTrackerDto) {
		return this.createTrackerUseCase.execute(body);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'tracker 수정 (전체 교체)' })
	async update(@Param() param: TrackerIdDto, @Body() body: UpdateTrackerDto) {
		return this.updateTrackerUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'tracker 삭제' })
	async delete(@Param() param: TrackerIdDto): Promise<void> {
		await this.deleteTrackerUseCase.execute(param.id);
	}
}
