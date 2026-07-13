// 참조 advertising이 없을 때만 advertiser를 삭제하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISER_REPOSITORY, AdvertiserRepository } from '@advertiser/domain/advertiser.repository';

@Injectable()
export class DeleteAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.advertiserRepository.findById(id))) {
			throw new NotFoundException();
		}

		// advertising이 FK로 참조 중이면 DB가 삭제를 막으므로(ON DELETE RESTRICT) 사전에 거부한다
		if ((await this.advertiserRepository.countAdvertising(id)) > 0) {
			throw new ConflictException('advertiser is referenced by advertising');
		}

		await this.advertiserRepository.delete(id);
	}
}
