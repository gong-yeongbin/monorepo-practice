import { Module } from '@nestjs/common';
import { AdvertiserController } from '@advertiser/presentation/advertiser.controller';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';
import { PrismaAdvertiserRepository } from '@advertiser/infrastructure/prisma-advertiser.repository';
import { AuthModule } from '@auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [AdvertiserController],
	providers: [ListAdvertiserUseCase, CreateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useClass: PrismaAdvertiserRepository }],
})
export class AdvertiserModule {}
