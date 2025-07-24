import { Module } from '@nestjs/common';
import { AdvertiserController } from './controller/advertiser.controller';
import { AdvertiserRepository } from './domain';
import { CreateAdvertiserUseCase, UpdateAdvertiserUseCase } from './use-case';
import { PrismaAdvertiserRepository } from './infrastructure';

@Module({
	controllers: [AdvertiserController],
	providers: [CreateAdvertiserUseCase, UpdateAdvertiserUseCase, { provide: AdvertiserRepository, useClass: PrismaAdvertiserRepository }],
})
export class AdvertiserModule {}
