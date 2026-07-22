// media 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { Media, MediaWithCampaignCount } from '@media/domain/media.entity';

export class MediaResponse implements Media {
	id: number;

	name: string;

	install_postback_url: string;

	event_postback_url: string;
}

export class MediaListItemResponse extends MediaResponse implements MediaWithCampaignCount {
	// 연결된 campaign 개수
	campaign: number;
}
