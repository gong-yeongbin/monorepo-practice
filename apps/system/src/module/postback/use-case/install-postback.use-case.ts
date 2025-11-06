import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PostbackDto } from '@postback/dto';
import { base64 } from '@src/common/util/base64.util';
import { Adbrixremaster, Adjust, Airbridge, Appsflyer } from '@postback/dto/install';

@Injectable()
export class InstallPostbackUseCase {
	constructor() {}

	async execute(tracker: string, query: any) {
		let installPostback!: Appsflyer | Airbridge | Adbrixremaster | Adjust;
		const eventName = 'install';

		switch (tracker) {
			case 'appsflyer':
				installPostback = plainToInstance(Appsflyer, query, { excludeExtraneousValues: true });
				break;
			case 'airbridge':
				installPostback = plainToInstance(Airbridge, query, { excludeExtraneousValues: true });
				break;
			case 'adbrixremaster':
				installPostback = plainToInstance(Adbrixremaster, query, { excludeExtraneousValues: true });
				break;
			case 'adjust':
				installPostback = plainToInstance(Adjust, query, { excludeExtraneousValues: true });
				break;
		}
		const pubId = base64.decode(installPostback.viewCode).split(':')[1] || null;
		const subId = base64.decode(installPostback.viewCode).split(':')[2] || null;

		return plainToInstance(PostbackDto, { tracker, eventName, ...installPostback, pubId, subId }, { excludeExtraneousValues: true, exposeDefaultValues: true });
	}
}
