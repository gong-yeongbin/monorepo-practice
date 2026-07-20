// user 2단계 가입(신청·코드 검증)과 조회·수정·삭제를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { RequestSignupDto } from '@user/application/dto/request-signup.dto';
import { VerifySignupDto } from '@user/application/dto/verify-signup.dto';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';
import { UserIdDto } from '@user/application/dto/user-id.dto';
import { RequestSignupUseCase } from '@user/application/request-signup.use-case';
import { VerifySignupUseCase } from '@user/application/verify-signup.use-case';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('user')
@UseInterceptors(ResponseInterceptor)
export class UserController {
	constructor(
		private readonly requestSignupUseCase: RequestSignupUseCase,
		private readonly verifySignupUseCase: VerifySignupUseCase,
		private readonly listUserUseCase: ListUserUseCase,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase
	) {}

	// 가입 1단계 — email·password를 받아 인증 코드를 발송한다. 이 시점에는 user가 생성되지 않으므로 201 대신 200을 반환한다
	@Post()
	@HttpCode(200)
	async requestSignup(@Body() body: RequestSignupDto): Promise<void> {
		await this.requestSignupUseCase.execute(body.email, body.password);
	}

	// 가입 2단계 — 메일로 받은 코드 검증을 통과하면 user가 생성된다
	@Post('verify')
	async verifySignup(@Body() body: VerifySignupDto): Promise<void> {
		await this.verifySignupUseCase.execute(body.email, body.code);
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
