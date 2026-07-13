// 참조 campaign이 없을 때만 advertising을 삭제하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';

@Injectable()
export class DeleteAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.advertisingRepository.exists(id))) {
			throw new NotFoundException();
		}

		// campaign이 FK로 참조 중이면 DB가 삭제를 막으므로(ON DELETE RESTRICT) 사전에 거부한다
		if ((await this.advertisingRepository.countCampaign(id)) > 0) {
			throw new ConflictException('advertising is referenced by campaign');
		}

		await this.advertisingRepository.delete(id);
	}
}
