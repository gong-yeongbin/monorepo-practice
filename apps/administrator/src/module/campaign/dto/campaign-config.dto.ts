import { Expose } from 'class-transformer';

export class CampaignConfigDto {
	@Expose({ name: 'sendMedia' })
	send_media: boolean;

	@Expose({ name: 'trackerEventName' })
	tracker_event_name: string;

	@Expose({ name: 'adminEventName' })
	admin_event_name: string;

	@Expose({ name: 'mediaEventName' })
	media_event_name: string;
}
