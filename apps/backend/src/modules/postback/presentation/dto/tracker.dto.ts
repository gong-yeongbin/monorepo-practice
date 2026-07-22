import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TRACKER_NAMES } from '@trackers/tracker.registry';

export class Tracker {
	@ApiProperty({ description: '트래커 이름', enum: TRACKER_NAMES, example: 'appsflyer' })
	@IsIn(TRACKER_NAMES)
	name: string;
}
