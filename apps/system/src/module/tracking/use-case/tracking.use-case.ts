import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { createHash } from 'crypto';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/symbol';
import { ICampaign } from '@tracking/domain/repositories';
import { Adbrixremaster, Adjust, Airbridge, Appsflyer, Singular } from '@tracking/dto';
import { TrackingDto } from '@tracking/dto/request';

@Injectable()
export class TrackingUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign) {}

	async execute(query: TrackingDto): Promise<string> {
		const { token, pubId, subId, adid, idfa } = query;
		const viewCode = createHash('sha256').update(`${token}${pubId}${subId}`).digest('base64');

		const campaign = await this.campaignRepository.find(token);
		if (!campaign) throw new NotFoundException();

		let mapping: Appsflyer | Airbridge | Adbrixremaster | Adjust | Singular;
		switch (campaign.tracker_name) {
			case 'appsflyer':
				mapping = plainToInstance(Appsflyer, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
			case 'airbridge':
				mapping = plainToInstance(Airbridge, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
			case 'adbrixremaster':
				mapping = plainToInstance(Adbrixremaster, { ...query, viewCode, m_adid: adid || idfa }, { excludeExtraneousValues: true });
				break;
			case 'adjust':
				mapping = plainToInstance(Adjust, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
			case 'singular':
				mapping = plainToInstance(Singular, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
		}

		const trackerTrackingUrl = campaign.tracker_tracking_url;
		return trackerTrackingUrl.replace(/\{(\w+)\}/g, (_, key) => mapping[key] ?? '');

		// 캐시 조회 (token)

		// ===== kafka producer =====
		// 데일리 클릭 카운트 (token + pub + sub = view_code)
		// 매체 전송
		// 트래킹 로그?
	}
}
