// campaign 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { ApiProperty } from '@nestjs/swagger';
import { Campaign, CampaignType } from '@campaign/domain/campaign.entity';
import { CampaignListRow } from '@campaign/domain/campaign.repository';

export class CampaignResponse implements Campaign {
	id: number;

	token: string;

	name: string;

	@ApiProperty({ enum: ['CPI', 'CPA'] })
	type: CampaignType;

	is_active: boolean;

	tracker_name: string;

	tracker_tracking_url: string;

	advertising_id: number;

	media_id: number;
}

export class CampaignListItemResponse implements CampaignListRow {
	campaign_id: number;

	token: string;

	campaign_name: string;

	type: string;

	is_active: boolean;

	media_name: string;
}
