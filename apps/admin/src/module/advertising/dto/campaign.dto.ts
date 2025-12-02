import { $Enums } from '@repo/prisma';

export class CampaignDto {
	id: number;
	name: string;
	token: string;
	type: $Enums.Type;
	is_active: boolean;
	tracker_tracking_url: string;
	tracker_name: string;
	advertising_name: string;
	media_name: string;
}
