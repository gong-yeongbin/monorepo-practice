import { Inject, Injectable } from '@nestjs/common';
import { PostbackDto } from '@postback/application/dto/postback.dto';
import { TRACKERS } from '@tracker/tracker.registry';
import { PRODUCER_PORT, ProducerPort } from '@core/kafka/producer.port';
import { base64 } from '@src/common/util/base64.util';

@Injectable()
export class EventPostbackUseCase {
	constructor(@Inject(PRODUCER_PORT) private readonly producer: ProducerPort) {}

	async execute(name: string, query: Record<string, string>): Promise<void> {
		// name은 컨트롤러에서 @IsIn(TRACKER_NAMES)로 검증된다
		const eventPostback = TRACKERS[name]!.event(query);
		const [, pubId, subId] = base64.decode(eventPostback.viewCode).split(':');

		const postback = PostbackDto.of({ ...eventPostback, trackerName: name, pubId: pubId || null, subId: subId || null, rawQueryParams: JSON.stringify(query) });

		await this.producer.send('postback', JSON.stringify(postback));
	}
}
