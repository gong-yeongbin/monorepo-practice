import { Controller, Get, Param, Query } from '@nestjs/common';
import { Tracker } from '@postback/presentation/dto/tracker.dto';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';

@Controller()
export class PostbackController {
	constructor(
		private readonly installPostbackUseCase: InstallPostbackUseCase,
		private readonly eventPostbackUseCase: EventPostbackUseCase
	) {}

	@Get(':name/install')
	async install(@Param() tracker: Tracker, @Query() query: Record<string, string>) {
		return await this.installPostbackUseCase.execute(tracker.name, query);
	}

	@Get(':name/event')
	async event(@Param() tracker: Tracker, @Query() query: Record<string, string>) {
		return await this.eventPostbackUseCase.execute(tracker.name, query);
	}
}
