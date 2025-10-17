import { Module } from '@nestjs/common';
import { AdController } from '@module/ad/controller';
import { AdRepository } from '@module/ad/domain';
import { PrismaAdRepository } from '@module/ad/infrastructure';
import { CreateAdUseCase, UpdateAdUseCase } from '@module/ad/use-case';

@Module({
	controllers: [AdController],
	providers: [CreateAdUseCase, UpdateAdUseCase, { provide: AdRepository, useClass: PrismaAdRepository }],
})
export class AdModule {}
