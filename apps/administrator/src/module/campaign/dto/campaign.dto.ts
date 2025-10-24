import { $Enums } from '@repo/prisma';
import { Expose } from 'class-transformer';

export class CampaignDto {
	@Expose()
	name: string;

	@Expose()
	type: $Enums.Type;

	@Expose({ name: 'trackerName' })
	tracker_name: string;

	@Expose({ name: 'advertisingName' })
	advertising_name: string;

	@Expose({ name: 'mediaName' })
	media_name: string;
}
