import { Module } from '@nestjs/common';
import { AdvertisingController } from '@advertising/presentation/advertising.controller';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { BriefAdvertisingUseCase } from '@advertising/application/brief-advertising.use-case';
import { InfoAdvertisingUseCase } from '@advertising/application/info-advertising.use-case';
import { CampaignListUseCase } from '@advertising/application/campaign-list.use-case';
import { DeactivateAdvertisingUseCase } from '@advertising/application/deactivate-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';
import { PrismaAdvertisingRepository } from '@advertising/infrastructure/prisma-advertising.repository';
import { AuthModule } from '@auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [AdvertisingController],
	providers: [
		CreateAdvertisingUseCase,
		ListAdvertisingUseCase,
		BriefAdvertisingUseCase,
		InfoAdvertisingUseCase,
		CampaignListUseCase,
		DeactivateAdvertisingUseCase,
		{ provide: ADVERTISING_REPOSITORY, useClass: PrismaAdvertisingRepository },
	],
})
export class AdvertisingModule {}
