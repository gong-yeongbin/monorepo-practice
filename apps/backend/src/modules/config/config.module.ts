import { Module } from '@nestjs/common';
import { ConfigController } from '@config/presentation/config.controller';
import { ListConfigUseCase } from '@config/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@config/application/replace-config.use-case';
import { CONFIG_REPOSITORY } from '@config/domain/config.repository';
import { PrismaConfigRepository } from '@config/infrastructure/prisma-config.repository';
import { AuthModule } from '@auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [ConfigController],
	providers: [ListConfigUseCase, ReplaceConfigUseCase, { provide: CONFIG_REPOSITORY, useClass: PrismaConfigRepository }],
})
export class ConfigModule {}
