import { Inject, Injectable } from '@nestjs/common';
import { PostbackDto } from '@postback/application/dto/postback.dto';
import { TRACKERS } from '@trackers/tracker.registry';
import { PRODUCER_PORT, ProducerPort } from '@infra/messaging/producer.port';
import { viewCodeCodec } from '@common/utils/view-code.util';

@Injectable()
export class InstallPostbackUseCase {
	constructor(@Inject(PRODUCER_PORT) private readonly producer: ProducerPort) {}

	async execute(name: string, query: Record<string, string>): Promise<void> {
		// name은 컨트롤러에서 @IsIn(TRACKER_NAMES)로 검증된다
		const installPostback = TRACKERS[name]!.install(query);
		const [, pubId, subId] = viewCodeCodec.decode(installPostback.viewCode).split(':');

		const postback = PostbackDto.of({ ...installPostback, trackerName: name, eventName: 'install', pubId: pubId || null, subId: subId || null, rawQueryParams: JSON.stringify(query) });

		await this.producer.send('postback', JSON.stringify(postback));
	}
}
