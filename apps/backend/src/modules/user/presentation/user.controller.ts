// user 조회·수정·삭제를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';
import { UserIdDto } from '@user/application/dto/user-id.dto';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

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
	async list() {
		return this.listUserUseCase.execute();
	}

	@Get(':id')
	@ApiOperation({ summary: 'user 단건 조회' })
	async get(@Param() param: UserIdDto) {
		return this.getUserUseCase.execute(param.id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'user 수정 (role·approved 부분 수정)' })
	async update(@Param() param: UserIdDto, @Body() body: UpdateUserDto) {
		return this.updateUserUseCase.execute(param.id, body);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'user 삭제' })
	async delete(@Param() param: UserIdDto): Promise<void> {
		await this.deleteUserUseCase.execute(param.id);
	}
}
