// 캠페인 도메인 엔티티
import { CampaignConfig } from '@postback/domain/campaign-config.entity';

export type CampaignType = 'CPI' | 'CPA';

export class Campaign {
	id: number;
	name: string;
	token: string;
	type: CampaignType;
	is_active: boolean;
	tracker_tracking_url: string;
	tracker_name: string;
	advertising_id: number;
	media_id: number;
	campaign_config: CampaignConfig[];

	constructor(props: {
		id: number;
		name: string;
		token: string;
		type: CampaignType;
		is_active: boolean;
		tracker_tracking_url: string;
		tracker_name: string;
		advertising_id: number;
		media_id: number;
		campaign_config: CampaignConfig[];
	}) {
		this.id = props.id;
		this.name = props.name;
		this.token = props.token;
		this.type = props.type;
		this.is_active = props.is_active;
		this.tracker_tracking_url = props.tracker_tracking_url;
		this.tracker_name = props.tracker_name;
		this.advertising_id = props.advertising_id;
		this.media_id = props.media_id;
		this.campaign_config = props.campaign_config;
	}
}
