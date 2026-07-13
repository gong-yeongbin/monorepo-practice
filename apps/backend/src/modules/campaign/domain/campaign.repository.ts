// campaign 조회·변경 repository 인터페이스와 DI 토큰
import { Campaign, CampaignType } from '@campaign/domain/campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

// 생성 시 advertising에서 도출하는 tracker 정보
export interface AdvertisingTrackerInfo {
	tracker_name: string;
	tracker_tracking_url: string;
}

export interface CreateCampaignProps {
	name: string;
	type: CampaignType;
	advertising_id: number;
	media_id: number;
	tracker_name: string;
	tracker_tracking_url: string;
}

// advertising_id·tracker 파생 필드는 불변. 나머지만 선택적으로 부분 수정한다.
export interface UpdateCampaignProps {
	name?: string;
	type?: CampaignType;
	media_id?: number;
	is_active?: boolean;
}

// advertising 단위 campaign 목록 조회 결과(연결 media명 포함)
export interface CampaignListRow {
	campaign_id: number;
	token: string;
	campaign_name: string;
	type: string;
	is_active: boolean;
	media_name: string;
}

export interface CampaignRepository {
	findById(id: number): Promise<Campaign | null>;
	findByAdvertisingId(advertising_id: number): Promise<CampaignListRow[]>;
	findAdvertisingTracker(advertising_id: number): Promise<AdvertisingTrackerInfo | null>;
	mediaExists(media_id: number): Promise<boolean>;
	create(props: CreateCampaignProps): Promise<Campaign>;
	update(id: number, props: UpdateCampaignProps): Promise<Campaign>;
	delete(id: number): Promise<void>;
}
