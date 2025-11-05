import { IsEnum } from 'class-validator';

enum Name {
	ADBRIXREMASTER = 'adbrixremaster',
	ADJUST = 'adjust',
	AIRBRIDGE = 'airbridge',
	APPSFLYER = 'appsflyer',
}

export class Tracker {
	@IsEnum(Name)
	name: string;
}
