import { Module } from '@nestjs/common';
import { MediaController } from '@module/media/controller';
import { CreateMediaUseCase, GetMediaListUseCase, UpdateMediaUseCase } from '@module/media/use-case';
import { MEDIA_REPOSITORY } from '@module/media/domain';
import { MediaRepository } from '@module/media/infrastructure';

@Module({
	controllers: [MediaController],
	providers: [CreateMediaUseCase, UpdateMediaUseCase, GetMediaListUseCase, { provide: MEDIA_REPOSITORY, useClass: MediaRepository }],
	exports: [MEDIA_REPOSITORY],
})
export class MediaModule {}
