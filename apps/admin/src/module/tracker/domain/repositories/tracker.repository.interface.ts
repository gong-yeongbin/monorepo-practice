import { CreateTrackerDto, UpdateTrackerDto } from '@module/tracker/dto';
import { Tracker } from '@module/tracker/domain/entities';

export interface ITracker {
	findById(id: number): Promise<Tracker | null>;
	findByName(name: string): Promise<Tracker | null>;
	findMany(): Promise<Tracker[]>;
	create(tracker: CreateTrackerDto): Promise<Tracker>;
	update(tracker: UpdateTrackerDto): Promise<Tracker>;
}
