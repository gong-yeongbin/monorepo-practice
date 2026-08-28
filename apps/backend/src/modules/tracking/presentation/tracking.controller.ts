import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { Public } from '@auth/presentation/public.decorator';

@ApiTags('tracking')
// 광고 클릭이 직접 호출하는 공개 엔드포인트 — 인증도 rate limit도 없다.
//
// ThrottlerGuard를 의도적으로 뺐다. @nestjs/throttler의 기본 인메모리 저장소는 키를 추가만 하고
// 지우지 않는데(ThrottlerStorageService), 이 경로의 키는 클라이언트 IP라 카디널리티가 사실상 무한이라
// 태스크 메모리를 무한히 먹는다. 요청마다 setTimeout을 만들고 만료 시 배열 전체를 filter하는 것도
// 요청량 제곱으로 나빠진다. 태스크별 인메모리라 실효 한도가 태스크 수만큼 곱해져 방어력도 약했다.
// 대가로 어뷰징 방어가 없다 — NLB에는 WAF가 붙지 않아 인프라 단으로 올릴 수단도 현재 없다.
// 되살리려면 공유 저장소(Valkey) 기반으로 붙일 것. 기본 저장소로 되돌리지 말 것.
@Public()
@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@ApiOperation({ summary: '트래킹 클릭 — 트래커 URL로 302 리다이렉트' })
	@ApiResponse({ status: 302, description: '트래커 트래킹 URL로 리다이렉트' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'token에 해당하는 campaign 또는 tracker 없음' })
	async tracking(@Query() query: QueryDto, @Res() res: Response) {
		const url = await this.trackingUseCase.execute(query);
		// res.redirect()는 HTML 바디("Found. Redirecting to...")를 붙인다.
		// 클릭량에 곱해지는 전송 바이트라 바디 없이 헤더만 보낸다.
		res.writeHead(302, { Location: url });
		res.end();
	}
}
