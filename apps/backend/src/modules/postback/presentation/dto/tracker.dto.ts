import { IsIn } from 'class-validator';
import { TRACKER_NAMES } from '@trackers/tracker.registry';

export class Tracker {
	@IsIn(TRACKER_NAMES)
	name: string;
}
