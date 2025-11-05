import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Adbrixremaster, Adjust, Airbridge, Appsflyer, PostbackDto } from '@postback/dto';
import { base64 } from '@src/common/util/base64.util';

@Injectable()
export class InstallPostbackUseCase {
	constructor() {}

	async execute(tracker: string, query: any) {
		let installPostback!: Appsflyer | Airbridge | Adbrixremaster | Adjust;
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

		const postbackDto = plainToInstance(PostbackDto, { ...installPostback, pubId, subId }, { excludeExtraneousValues: true, exposeDefaultValues: true });
		console.log(postbackDto);
	}
}
