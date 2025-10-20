import { Module } from '@nestjs/common';
import { AdvertiserController } from '@module/advertiser/controller';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { AdvertiserRepository } from '@module/advertiser/infrastructure';
import { CreateAdvertiserUseCase } from '@module/advertiser/use-case';

@Module({
	controllers: [AdvertiserController],
	providers: [CreateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useClass: AdvertiserRepository }],
})
export class AdvertiserModule {}
