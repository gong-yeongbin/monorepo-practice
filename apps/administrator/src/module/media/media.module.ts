import { Module } from '@nestjs/common';
import { MediaController } from '@module/media/controller';
import { CreateMediaUseCase, UpdateMediaUseCase } from '@module/media/use-case';
import { MediaRepository } from '@module/media/domain';
import { PrismaMediaRepository } from '@module/media/infrastructure';

@Module({
	controllers: [MediaController],
	providers: [CreateMediaUseCase, UpdateMediaUseCase, { provide: MediaRepository, useClass: PrismaMediaRepository }],
})
export class MediaModule {}
