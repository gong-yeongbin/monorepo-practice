import { Tracker } from './tracker.entity';
import { TrackerDto } from '../shared/dto';

export abstract class TrackerRepository {
	abstract find(name: string): Promise<Tracker | null>;
	abstract create(tracker: TrackerDto): Promise<Tracker>;
}
