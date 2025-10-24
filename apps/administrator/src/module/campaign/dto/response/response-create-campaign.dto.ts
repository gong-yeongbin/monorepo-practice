import { Expose } from 'class-transformer';

export class ResponseCreateCampaignDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose()
	token: string;

	@Expose()
	type: string;

	@Expose({ name: 'is_active' })
	isActive: boolean;

	@Expose({ name: 'tracker_name' })
	trackerName: string;

	@Expose({ name: 'advertising_name' })
	advertisingName: string;

	@Expose({ name: 'media_name' })
	mediaName: string;
}
