// campaign 이벤트 매핑(config) 응답 스키마(Swagger 문서용). 도메인 CampaignConfig와 필드를 동일하게 유지한다
import { CampaignConfig } from '@config/domain/config.entity';

export class ConfigResponse implements CampaignConfig {
	id: number;

	campaign_id: number;

	send_media: boolean;

	tracker_event_name: string;

	admin_event_name: string;

	media_event_name: string;
}
