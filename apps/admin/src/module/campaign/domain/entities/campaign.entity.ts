import { $Enums, campaign } from '@repo/prisma';

export class Campaign implements campaign {
	advertising_id: number;
	media_id: number;
	id: number;
	name: string;
	token: string;
	type: $Enums.Type;
	is_active: boolean;
	tracker_tracking_url: string;
}
