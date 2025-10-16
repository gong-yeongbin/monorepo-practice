import { Module } from '@nestjs/common';
import { MediaController } from './controller/media.controller';
import { CreateMediaUseCase, UpdateMediaUseCase } from './use-case';
import { MediaRepository } from './domain';
import { PrismaMediaRepository } from './infrastructure';

@Module({
	controllers: [MediaController],
	providers: [CreateMediaUseCase, UpdateMediaUseCase, { provide: MediaRepository, useClass: PrismaMediaRepository }],
})
export class MediaModule {}
