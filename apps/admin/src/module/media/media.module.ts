import { Module } from '@nestjs/common';
import { MediaResolver } from '@media/controller';
import { CreateMediaUseCase, GetMediaListUseCase, UpdateMediaUseCase } from '@media/use-case';
import { MediaRepository } from '@media/infrastructure';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';

@Module({
	providers: [MediaResolver, CreateMediaUseCase, UpdateMediaUseCase, GetMediaListUseCase, { provide: MEDIA_REPOSITORY, useClass: MediaRepository }],
	exports: [MEDIA_REPOSITORY],
})
export class MediaModule {}
