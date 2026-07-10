// media 목록 조회를 처리하는 컨트롤러
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ListMediaUseCase } from '@media/application/list-media.use-case';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('media')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class MediaController {
	constructor(private readonly listMediaUseCase: ListMediaUseCase) {}

	@Get()
	async getMedia() {
		return this.listMediaUseCase.execute();
	}
}
