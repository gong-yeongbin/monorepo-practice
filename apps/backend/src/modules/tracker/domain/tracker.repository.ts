// tracker 조회 repository 인터페이스와 DI 토큰
import { Tracker } from '@tracker/domain/tracker.entity';

export const TRACKER_REPOSITORY = Symbol('TRACKER_REPOSITORY');

export interface TrackerRepository {
	findAll(): Promise<Tracker[]>;
}
