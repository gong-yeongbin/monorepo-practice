// user CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from '@user/application/dto/create-user.dto';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';
import { UserIdDto } from '@user/application/dto/user-id.dto';
import { CreateUserUseCase } from '@user/application/create-user.use-case';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('user')
@UseInterceptors(ResponseInterceptor)
export class UserController {
	constructor(
		private readonly createUserUseCase: CreateUserUseCase,
		private readonly listUserUseCase: ListUserUseCase,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase
	) {}

	@Post()
	async create(@Body() body: CreateUserDto): Promise<void> {
		await this.createUserUseCase.execute(body.email);
	}

	@Get()
	async list() {
		return this.listUserUseCase.execute();
	}

	@Get(':id')
	async get(@Param() param: UserIdDto) {
		return this.getUserUseCase.execute(param.id);
	}

	@Patch(':id')
	async update(@Param() param: UserIdDto, @Body() body: UpdateUserDto) {
		return this.updateUserUseCase.execute(param.id, body);
	}

	@Delete(':id')
	async delete(@Param() param: UserIdDto): Promise<void> {
		await this.deleteUserUseCase.execute(param.id);
	}
}
