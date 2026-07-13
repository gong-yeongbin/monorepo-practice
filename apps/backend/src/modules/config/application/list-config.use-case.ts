// campaign에 등록된 이벤트 매핑(campaign_config) 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { CampaignConfig } from '@config/domain/config.entity';
import { CONFIG_REPOSITORY, ConfigRepository } from '@config/domain/config.repository';

@Injectable()
export class ListConfigUseCase {
	constructor(@Inject(CONFIG_REPOSITORY) private readonly configRepository: ConfigRepository) {}

	async execute(campaign_id: number): Promise<CampaignConfig[]> {
		return this.configRepository.findByCampaignId(campaign_id);
	}
}
