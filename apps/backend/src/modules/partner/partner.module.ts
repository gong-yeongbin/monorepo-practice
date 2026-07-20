import { Module } from '@nestjs/common';
import { PartnerController } from '@partner/presentation/partner.controller';
import { PartnerStatsUseCase } from '@partner/application/partner-stats.use-case';
import { PARTNER_REPOSITORY } from '@partner/domain/partner.repository';
import { PrismaPartnerRepository } from '@partner/infrastructure/prisma-partner.repository';

@Module({
	controllers: [PartnerController],
	providers: [PartnerStatsUseCase, { provide: PARTNER_REPOSITORY, useClass: PrismaPartnerRepository }],
})
export class PartnerModule {}
