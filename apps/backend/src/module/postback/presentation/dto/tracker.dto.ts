import { IsIn } from 'class-validator';
import { TRACKER_NAMES } from '@tracker/tracker.registry';

export class Tracker {
	@IsIn(TRACKER_NAMES)
	name: string;
}
