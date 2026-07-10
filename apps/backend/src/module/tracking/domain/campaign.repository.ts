// 캠페인 조회 repository 인터페이스와 DI 토큰
import { Campaign } from '@tracking/domain/campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface CampaignRepository {
	findByToken(token: string): Promise<Campaign | null>;
}
