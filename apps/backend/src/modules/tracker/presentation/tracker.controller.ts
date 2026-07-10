// tracker 목록 조회를 처리하는 컨트롤러
import { Controller, Get } from '@nestjs/common';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';

// admin 원본과 동일하게 인증·ResponseInterceptor 없이 둔다(원본 tracker 컨트롤러엔 둘 다 없었음).
// 다른 어드민 API와 다른 점이라 향후 정책 통일이 필요하면 별도 판단.
@Controller('tracker')
export class TrackerController {
	constructor(private readonly listTrackerUseCase: ListTrackerUseCase) {}

	@Get()
	async getTrackerList() {
		return this.listTrackerUseCase.execute();
	}
}
