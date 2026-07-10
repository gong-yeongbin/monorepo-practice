// partner 통계 집계 repository 인터페이스와 DI 토큰
import { PartnerRow } from '@partner/domain/partner.entity';

export const PARTNER_REPOSITORY = Symbol('PARTNER_REPOSITORY');

export interface PartnerRepository {
	// media 기준: 해당 media에 속한 캠페인들의 오늘자 통계를 advertising별로 합산
	statsByMedia(media_id: number, date: Date): Promise<PartnerRow[]>;
	// advertiser 기준: 해당 advertiser의 advertising들의 오늘자 통계를 advertising별로 합산
	statsByAdvertiser(advertiser_id: number, date: Date): Promise<PartnerRow[]>;
}
