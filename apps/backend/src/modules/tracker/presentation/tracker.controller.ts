// tracker CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
	@ApiResponse({ status: 200, description: '조회 성공' })
	async list() {
		return this.listTrackerUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'tracker 단건 조회' })
	@ApiResponse({ status: 200, description: '조회 성공' })
	@ApiResponse({ status: 404, description: 'tracker 없음' })
	async get(@Param() param: TrackerIdDto) {
		return this.getTrackerUseCase.execute(param.id);
	}

	@Post()
	@ApiOperation({ summary: 'tracker 생성' })
	@ApiResponse({ status: 201, description: '생성 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 409, description: '이미 존재하는 tracker 이름' })
	async create(@Body() body: CreateTrackerDto) {
		return this.createTrackerUseCase.execute(body);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'tracker 수정 (전체 교체)' })
	@ApiResponse({ status: 200, description: '수정 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'tracker 없음' })
	@ApiResponse({ status: 409, description: '이미 존재하는 tracker 이름' })
	async update(@Param() param: TrackerIdDto, @Body() body: UpdateTrackerDto) {
		return this.updateTrackerUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'tracker 삭제' })
	@ApiResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: 'tracker 없음' })
	@ApiResponse({ status: 409, description: 'advertising에서 참조 중이라 삭제 불가' })
	async delete(@Param() param: TrackerIdDto): Promise<void> {
		await this.deleteTrackerUseCase.execute(param.id);
	}
}
