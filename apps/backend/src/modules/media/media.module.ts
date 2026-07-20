import { Module } from '@nestjs/common';
import { MediaController } from '@media/presentation/media.controller';
import { ListMediaUseCase } from '@media/application/list-media.use-case';
import { GetMediaUseCase } from '@media/application/get-media.use-case';
import { CreateMediaUseCase } from '@media/application/create-media.use-case';
import { UpdateMediaUseCase } from '@media/application/update-media.use-case';
import { DeleteMediaUseCase } from '@media/application/delete-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';
import { PrismaMediaRepository } from '@media/infrastructure/prisma-media.repository';

@Module({
	controllers: [MediaController],
	providers: [
		ListMediaUseCase,
		GetMediaUseCase,
		CreateMediaUseCase,
		UpdateMediaUseCase,
		DeleteMediaUseCase,
		{ provide: MEDIA_REPOSITORY, useClass: PrismaMediaRepository },
	],
})
export class MediaModule {}
