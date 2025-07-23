import { Tracker } from '@repo/prisma/entity';
import { TrackerDto } from '../shared/dto';

export abstract class TrackerRepository {
	abstract findById(id: number): Promise<Tracker | null>;
	abstract findByName(name: string): Promise<Tracker | null>;
	abstract create(tracker: TrackerDto): Promise<Tracker>;
	abstract update(id: number, tracker: TrackerDto): Promise<Tracker>;
}
