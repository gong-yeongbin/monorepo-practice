// user 조회·수정·삭제를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';
import { UserIdDto } from '@user/application/dto/user-id.dto';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { UserResponse } from '@user/presentation/dto/user.response.dto';

@ApiTags('user')
@Controller('user')
@UseInterceptors(ResponseInterceptor)
export class UserController {
	constructor(
		private readonly listUserUseCase: ListUserUseCase,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase
	) {}

	@Get()
	@ApiOperation({ summary: 'user 목록 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: UserResponse, isArray: true })
	async list() {
		return this.listUserUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'user 단건 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: UserResponse })
	@ApiResponse({ status: 404, description: 'user 없음' })
	async get(@Param() param: UserIdDto) {
		return this.getUserUseCase.execute(param.id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'user 수정 (role·approved 부분 수정)' })
	@ApiWrappedResponse({ status: 200, description: '수정 성공', type: UserResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'user 없음' })
	async update(@Param() param: UserIdDto, @Body() body: UpdateUserDto) {
		return this.updateUserUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'user 삭제' })
	@ApiWrappedResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: 'user 없음' })
	async delete(@Param() param: UserIdDto): Promise<void> {
		await this.deleteUserUseCase.execute(param.id);
	}
}
