import { Tracker } from '@tracker/domain/entities';
import { CreateTrackerDto, UpdateTrackerDto } from '@tracker/dto';

export interface ITracker {
	findById(id: number): Promise<Tracker | null>;
	findByName(name: string): Promise<Tracker | null>;
	findMany(): Promise<Tracker[]>;
	create(tracker: CreateTrackerDto): Promise<Tracker>;
	update(tracker: UpdateTrackerDto): Promise<Tracker>;
}
