// user 생성을 처리하는 컨트롤러
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from '@user/application/dto/create-user.dto';
import { CreateUserUseCase } from '@user/application/create-user.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	// admin 원본과 동일하게 인증 없이 열어 둔다(최초 관리자 계정 부트스트랩 필요). 접근 제어가 필요하면 별도 설계 사안.
	@Post('user')
	async addUser(@Body() body: CreateUserDto): Promise<void> {
		await this.createUserUseCase.execute(body);
	}
}
