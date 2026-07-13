// tracker 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { Tracker } from '@tracker/domain/tracker.entity';

export const TRACKER_REPOSITORY = Symbol('TRACKER_REPOSITORY');

export interface CreateTrackerProps {
	name: string;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}

export type UpdateTrackerProps = CreateTrackerProps;

export interface TrackerRepository {
	findAll(): Promise<Tracker[]>;
	findById(id: number): Promise<Tracker | null>;
	findByName(name: string): Promise<Tracker | null>;
	create(props: CreateTrackerProps): Promise<Tracker>;
	update(id: number, props: UpdateTrackerProps): Promise<Tracker>;
	delete(id: number): Promise<void>;
	countAdvertising(tracker_id: number): Promise<number>;
}
