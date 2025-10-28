import { $Enums, campaign } from '@repo/prisma';

export class Campaign implements campaign {
	id: number;
	name: string;
	token: string;
	type: $Enums.Type;
	is_active: boolean;
	tracker_tracking_url: string;
	advertising_name: string;
	media_name: string;
}
