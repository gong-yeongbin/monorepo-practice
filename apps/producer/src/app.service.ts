import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
	constructor(private readonly configService: ConfigService) {}

	getHello(): string {
		return `[producer] Hello World! ${this.configService.get<string>('PORT')}`;
	}
}
