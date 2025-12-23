import { Module } from '@nestjs/common';
import { CreateMediaUseCase, GetMediaListUseCase, UpdateMediaUseCase } from '@module/media/use-case';
import { MEDIA_REPOSITORY } from '@module/media/domain';
import { MediaRepository } from '@module/media/infrastructure';
import { MediaResolver } from '@module/media/controller/media.resolver';

@Module({
	providers: [MediaResolver, CreateMediaUseCase, UpdateMediaUseCase, GetMediaListUseCase, { provide: MEDIA_REPOSITORY, useClass: MediaRepository }],
	exports: [MEDIA_REPOSITORY],
})
export class MediaModule {}
