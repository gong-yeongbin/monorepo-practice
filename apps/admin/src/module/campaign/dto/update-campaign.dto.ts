import { Expose } from 'class-transformer';
import { $Enums } from '@repo/prisma';

export class UpdateCampaignDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose()
	type: $Enums.Type;

	@Expose({ name: 'trackerTrackingUrl' })
	tracker_tracking_url: string;
}
