import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '@repo/prisma';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly prismaService: PrismaService
	) {}

	@Get()
	async getHello(): Promise<string> {
		console.log(await this.prismaService.media.findMany({ where: { campaign: { some: { token: 'asdfasdf' } } } }));
		return this.appService.getHello();
	}
}
