import { $Enums, campaign } from '@repo/prisma';
import { CampaignConfig } from '@tracking/domain/entities/campaign-config.entity';

export class Campaign implements campaign {
	name: string;
	id: number;
	token: string;
	type: $Enums.Type;
	is_active: boolean;
	tracker_tracking_url: string;
	tracker_name: string;
	advertising_name: string;
	media_name: string;
	campaign_config: CampaignConfig[];
}
