// partner 통계 조회를 처리하는 컨트롤러
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PartnerStatsUseCase } from '@partner/application/partner-stats.use-case';
import { PartnerIdDto, PartnerTypeDto } from '@partner/application/dto/partner-query.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@ApiTags('partner')
@Controller('partner')
@UseInterceptors(ResponseInterceptor)
export class PartnerController {
	constructor(private readonly partnerStatsUseCase: PartnerStatsUseCase) {}

	@Get(':id')
	@ApiOperation({ summary: 'partner 통계 조회 (type=media면 media 기준, 그 외 advertiser 기준)' })
	@ApiResponse({ status: 200, description: '조회 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async get(@Param() param: PartnerIdDto, @Query() query: PartnerTypeDto) {
		return this.partnerStatsUseCase.execute(param.id, query.type);
	}
}
