import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PostbackDto } from '@postback/dto';
import { base64 } from '@src/common/util/base64.util';
import { Adbrixremaster, Adjust, Airbridge, Appsflyer } from '@postback/dto/event';

@Injectable()
export class EventPostbackUseCase {
	constructor() {}

	async execute(tracker: string, query: any) {
		let eventPostback!: Appsflyer | Airbridge | Adbrixremaster | Adjust;

		switch (tracker) {
			case 'appsflyer':
				eventPostback = plainToInstance(Appsflyer, query, { excludeExtraneousValues: true });
				break;
			case 'airbridge':
				eventPostback = plainToInstance(Airbridge, query, { excludeExtraneousValues: true });
				break;
			case 'adbrix-remaster':
				eventPostback = plainToInstance(Adbrixremaster, query, { excludeExtraneousValues: true });
				break;
			case 'adjust':
				eventPostback = plainToInstance(Adjust, query, { excludeExtraneousValues: true });
				break;
		}
		const pubId = base64.decode(eventPostback.viewCode).split(':')[1] || null;
		const subId = base64.decode(eventPostback.viewCode).split(':')[2] || null;

		return plainToInstance(PostbackDto, { tracker, ...eventPostback, pubId, subId, query: JSON.stringify(query) }, { excludeExtraneousValues: true, exposeDefaultValues: true });
	}
}
