import { Module } from '@nestjs/common';
import { AdvertisingController } from '@advertising/presentation/advertising.controller';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { GetAdvertisingUseCase } from '@advertising/application/get-advertising.use-case';
import { UpdateAdvertisingUseCase } from '@advertising/application/update-advertising.use-case';
import { DeleteAdvertisingUseCase } from '@advertising/application/delete-advertising.use-case';
import { UploadAdvertisingImageUseCase } from '@advertising/application/upload-advertising-image.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';
import { PrismaAdvertisingRepository } from '@advertising/infrastructure/prisma-advertising.repository';
import { StorageModule } from '@infra/storage/storage.module';

@Module({
	imports: [StorageModule],
	controllers: [AdvertisingController],
	providers: [
		CreateAdvertisingUseCase,
		ListAdvertisingUseCase,
		GetAdvertisingUseCase,
		UpdateAdvertisingUseCase,
		DeleteAdvertisingUseCase,
		UploadAdvertisingImageUseCase,
		{ provide: ADVERTISING_REPOSITORY, useClass: PrismaAdvertisingRepository },
	],
})
export class AdvertisingModule {}
