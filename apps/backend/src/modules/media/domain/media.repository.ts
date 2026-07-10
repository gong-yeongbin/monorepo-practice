// media 조회 repository 인터페이스와 DI 토큰
import { MediaWithCampaignCount } from '@media/domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface MediaRepository {
	findAllWithCampaignCount(): Promise<MediaWithCampaignCount[]>;
}
