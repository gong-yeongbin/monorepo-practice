import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@tracking/domain/campaign.repository';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TRACKERS } from '@tracker/tracker.registry';
import { CACHE_PORT, CachePort } from '@core/cache/cache.port';
import { PRODUCER_PORT, ProducerPort } from '@core/kafka/producer.port';
import { base64 } from '@src/common/util/base64.util';

const TRACKING_URL_CACHE_TTL = 1000 * 60 * 30;

@Injectable()
export class TrackingUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		@Inject(PRODUCER_PORT) private readonly producer: ProducerPort
	) {}

	async execute(query: QueryDto): Promise<string> {
		const { token } = query;
		const viewCode = base64.encode(`${token}:${query.pubId ?? ''}:${query.subId ?? ''}`);

		const cachedUrl = await this.cache.get(viewCode);
		if (cachedUrl) {
			await this.producer.send('tracking', viewCode);
			return cachedUrl;
		}

		const campaign = await this.campaignRepository.findByToken(token);
		if (!campaign) throw new NotFoundException();

		const tracker = TRACKERS[campaign.tracker_name];
		if (!tracker) throw new NotFoundException();

		const params = tracker.tracking({ ...query, viewCode });
		const url = campaign.tracker_tracking_url.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '');

		await this.cache.set(viewCode, url, TRACKING_URL_CACHE_TTL);
		await this.producer.send('tracking', viewCode);
		return url;
	}
}
