// campaign의 이벤트 매핑(campaign_config)을 전체 교체하는 use-case(admin patchRegisteredEvent 대응)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONFIG_REPOSITORY, ConfigRepository } from '@config/domain/config.repository';
import { ReplaceConfigDto } from '@config/application/dto/replace-config.dto';

@Injectable()
export class ReplaceConfigUseCase {
	constructor(@Inject(CONFIG_REPOSITORY) private readonly configRepository: ConfigRepository) {}

	async execute(campaign_id: number, configs: ReplaceConfigDto[]): Promise<void> {
		if (!(await this.configRepository.campaignExists(campaign_id))) {
			throw new NotFoundException();
		}

		await this.configRepository.replace(campaign_id, configs);
	}
}
