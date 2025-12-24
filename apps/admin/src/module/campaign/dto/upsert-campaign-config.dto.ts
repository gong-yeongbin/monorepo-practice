import { Expose } from 'class-transformer';

export class UpsertCampaignConfigDto {
	@Expose({ name: 'campaignId' })
	campaign_id: number;

	@Expose({ name: 'sendMedia' })
	send_media: boolean;

	@Expose({ name: 'trackerEventName' })
	tracker_event_name: string;

	@Expose({ name: 'adminEventName' })
	admin_event_name: string;

	@Expose({ name: 'mediaEventName' })
	media_event_name: string;
}
