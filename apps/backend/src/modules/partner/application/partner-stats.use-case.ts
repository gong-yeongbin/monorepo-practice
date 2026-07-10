// type에 따라 media/advertiser 기준으로 오늘자 통계를 집계하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { kstBaseDate } from '@common/utils/date.util';
import { PartnerRow } from '@partner/domain/partner.entity';
import { PARTNER_REPOSITORY, PartnerRepository } from '@partner/domain/partner.repository';

@Injectable()
export class PartnerStatsUseCase {
	constructor(@Inject(PARTNER_REPOSITORY) private readonly partnerRepository: PartnerRepository) {}

	async execute(id: number, type?: string): Promise<PartnerRow[]> {
		const today = kstBaseDate();

		if (type === 'media') {
			return this.partnerRepository.statsByMedia(id, today);
		}

		return this.partnerRepository.statsByAdvertiser(id, today);
	}
}
