import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/symbol';
import { ICampaign } from '@tracking/domain/repositories';
import { Adbrixremaster, Adjust, Airbridge, Appsflyer } from '@tracking/dto';
import { BodyDto, QueryDto } from '@tracking/dto/request';

@Injectable()
export class TrackingUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign) {}

	async execute(query: QueryDto, body: BodyDto): Promise<string> {
		const { token, adid, idfa } = query;
		const { viewCode } = body;

		const campaign = await this.campaignRepository.findByToken(token);
		if (!campaign) throw new NotFoundException();

		let instance!: Appsflyer | Airbridge | Adbrixremaster | Adjust;
		switch (campaign.tracker_name) {
			case 'appsflyer':
				instance = plainToInstance(Appsflyer, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
			case 'airbridge':
				instance = plainToInstance(Airbridge, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
			case 'adbrix-remaster':
				instance = plainToInstance(Adbrixremaster, { ...query, viewCode, m_adid: adid || idfa }, { excludeExtraneousValues: true });
				break;
			case 'adjust':
				instance = plainToInstance(Adjust, { ...query, viewCode }, { excludeExtraneousValues: true });
				break;
		}

		const trackerTrackingUrl = campaign.tracker_tracking_url;
		return trackerTrackingUrl.replace(/\{(\w+)\}/g, (_, key) => instance[key] ?? '');
	}
}
