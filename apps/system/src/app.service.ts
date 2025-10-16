import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
	constructor(private readonly configService: ConfigService) {}

	getHello() {
		return `[system] Hello World! ${this.configService.get<string>('PORT')}`;
	}
}
