import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/controller';
import { EventPostbackUseCase, InstallPostbackUseCase } from '@postback/use-case';

@Module({
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase, EventPostbackUseCase],
})
export class PostbackModule {}
