import { AdController } from './controller/ad.controller';
import { Module } from '@nestjs/common';
import { AdRepository } from './domain';
import { PrismaAdRepository } from './infrastructure';
import { CreateAdUseCase, UpdateAdUseCase } from './use-case';

@Module({
	controllers: [AdController],
	providers: [CreateAdUseCase, UpdateAdUseCase, { provide: AdRepository, useClass: PrismaAdRepository }],
})
export class AdModule {}
