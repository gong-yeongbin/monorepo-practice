import { Module } from '@nestjs/common';
import { AdvertiserController } from './controller/advertiser.controller';
import { AdvertiserRepository } from './domain';
import { CreateAdvertiserUseCase, GetAdvertiserListUseCase, UpdateAdvertiserUseCase } from './use-case';
import { PrismaAdvertiserRepository } from './infrastructure';

@Module({
	controllers: [AdvertiserController],
	providers: [CreateAdvertiserUseCase, UpdateAdvertiserUseCase, GetAdvertiserListUseCase, { provide: AdvertiserRepository, useClass: PrismaAdvertiserRepository }],
	exports: [AdvertiserRepository],
})
export class AdvertiserModule {}
