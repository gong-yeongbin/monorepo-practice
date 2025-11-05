import { Controller, Get, Param, Query } from '@nestjs/common';
import { Tracker } from '@postback/dto';
import { InstallPostbackUseCase } from '@postback/use-case';

@Controller()
export class PostbackController {
	constructor(private readonly installPostbackUseCase: InstallPostbackUseCase) {}

	@Get(':name/install')
	async install(@Param() tracker: Tracker, @Query() query: any) {
		await this.installPostbackUseCase.execute(tracker.name, query);
	}

	@Get(':tracker/event')
	async event() {}
}
