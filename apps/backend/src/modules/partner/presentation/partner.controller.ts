// partner 통계 조회를 처리하는 컨트롤러
import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { PartnerStatsUseCase } from '@partner/application/partner-stats.use-case';
import { PartnerIdDto, PartnerTypeDto } from '@partner/application/dto/partner-query.dto';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('partner')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class PartnerController {
	constructor(private readonly partnerStatsUseCase: PartnerStatsUseCase) {}

	@Get(':id')
	async get(@Param() param: PartnerIdDto, @Query() query: PartnerTypeDto) {
		return this.partnerStatsUseCase.execute(param.id, query.type);
	}
}
