import { Module } from '@nestjs/common';
import { MediaController } from '@media/presentation/media.controller';
import { ListMediaUseCase } from '@media/application/list-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';
import { PrismaMediaRepository } from '@media/infrastructure/prisma-media.repository';
import { AuthModule } from '@auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [MediaController],
	providers: [ListMediaUseCase, { provide: MEDIA_REPOSITORY, useClass: PrismaMediaRepository }],
})
export class MediaModule {}
