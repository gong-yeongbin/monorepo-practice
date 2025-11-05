import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/controller';
import { InstallPostbackUseCase } from '@postback/use-case';

@Module({
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase],
})
export class PostbackModule {}
