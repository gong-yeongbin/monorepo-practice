import { campaign_config } from '@repo/prisma';

export class CampaignConfig implements campaign_config {
	id: number;
	token: string;
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
	campaign_id: number;
}
