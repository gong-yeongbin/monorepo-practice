// campaign_config 조회·교체 repository 인터페이스와 DI 토큰
import { CampaignConfig } from '@config/domain/config.entity';

export const CONFIG_REPOSITORY = Symbol('CONFIG_REPOSITORY');

export interface UpsertConfigProps {
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
}

export interface ConfigRepository {
	campaignExists(campaign_id: number): Promise<boolean>;
	findByCampaignId(campaign_id: number): Promise<CampaignConfig[]>;
	replace(campaign_id: number, configs: UpsertConfigProps[]): Promise<void>;
}
