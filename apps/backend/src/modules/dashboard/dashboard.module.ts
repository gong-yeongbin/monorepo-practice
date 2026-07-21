import { Module } from '@nestjs/common';
import { DashboardController } from '@dashboard/presentation/dashboard.controller';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';
import { PrismaDashboardRepository } from '@dashboard/infrastructure/prisma-dashboard.repository';

@Module({
	controllers: [DashboardController],
	providers: [DashboardUseCase, DailyUseCase, DetailUseCase, { provide: DASHBOARD_REPOSITORY, useClass: PrismaDashboardRepository }],
})
export class DashboardModule {}
