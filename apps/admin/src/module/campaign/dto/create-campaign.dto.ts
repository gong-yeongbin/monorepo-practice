import { Expose } from 'class-transformer';
import { $Enums } from '@repo/prisma';

export class CreateCampaignDto {
	@Expose()
	name: string;

	@Expose()
	type: $Enums.Type;

	@Expose({ name: 'trackerTrackingUrl' })
	tracker_tracking_url: string;

	@Expose({ name: 'advertisingName' })
	advertising_name: string;

	@Expose({ name: 'mediaName' })
	media_name: string;
}
