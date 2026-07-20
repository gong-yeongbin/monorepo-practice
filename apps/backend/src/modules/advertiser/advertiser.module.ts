import { Module } from '@nestjs/common';
import { AdvertiserController } from '@advertiser/presentation/advertiser.controller';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { GetAdvertiserUseCase } from '@advertiser/application/get-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { UpdateAdvertiserUseCase } from '@advertiser/application/update-advertiser.use-case';
import { DeleteAdvertiserUseCase } from '@advertiser/application/delete-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';
import { PrismaAdvertiserRepository } from '@advertiser/infrastructure/prisma-advertiser.repository';

@Module({
	controllers: [AdvertiserController],
	providers: [
		ListAdvertiserUseCase,
		GetAdvertiserUseCase,
		CreateAdvertiserUseCase,
		UpdateAdvertiserUseCase,
		DeleteAdvertiserUseCase,
		{ provide: ADVERTISER_REPOSITORY, useClass: PrismaAdvertiserRepository },
	],
})
export class AdvertiserModule {}
