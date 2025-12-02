import { Tracker } from './tracker.entity';
import { TrackerDto } from '@module/tracker/dto/tracker.dto';

export interface ITracker {
	findById(id: number): Promise<Tracker | null>;
	findByName(name: string): Promise<Tracker | null>;
	findMany(): Promise<Tracker[] | null>;
	create(tracker: TrackerDto): Promise<Tracker>;
	update(id: number, tracker: TrackerDto): Promise<Tracker>;
}
