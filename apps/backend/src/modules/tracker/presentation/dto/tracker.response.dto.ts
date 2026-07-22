// tracker 응답 스키마(Swagger 문서용). 도메인 Tracker와 필드를 동일하게 유지한다
import { Tracker } from '@tracker/domain/tracker.entity';

export class TrackerResponse implements Tracker {
	id: number;

	name: string;

	tracking_url: string;

	install_postback_url: string;

	event_postback_url: string;
}
