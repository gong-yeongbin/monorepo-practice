import { IsEnum } from 'class-validator';

enum Name {
	ADBRIXREMASTER = 'adbrix-remaster',
	ADJUST = 'adjust',
	AIRBRIDGE = 'airbridge',
	APPSFLYER = 'appsflyer',
}

export class Tracker {
	@IsEnum(Name)
	name: string;
}
