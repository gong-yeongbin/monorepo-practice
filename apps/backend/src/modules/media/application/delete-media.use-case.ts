// 참조 campaign이 없을 때만 media를 삭제하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MEDIA_REPOSITORY, MediaRepository } from '@media/domain/media.repository';

@Injectable()
export class DeleteMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: MediaRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.mediaRepository.findById(id))) {
			throw new NotFoundException();
		}

		// campaign이 FK로 참조 중이면 DB가 삭제를 막으므로(ON DELETE RESTRICT) 사전에 거부한다
		if ((await this.mediaRepository.countCampaign(id)) > 0) {
			throw new ConflictException('media is referenced by campaign');
		}

		await this.mediaRepository.delete(id);
	}
}
