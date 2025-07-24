import { Module } from '@nestjs/common';
import { AdvertiserController } from './controller/advertiser.controller';
import { AdvertiserRepository } from './domain';
import { CreateAdvertiserUseCase } from './use-case';
import { PrismaAdvertiserRepository } from './infrastructure';

@Module({
	controllers: [AdvertiserController],
	providers: [CreateAdvertiserUseCase, { provide: AdvertiserRepository, useClass: PrismaAdvertiserRepository }],
})
export class AdvertiserModule {}
