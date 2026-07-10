// media 전체를 campaign 개수와 함께 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { MediaWithCampaignCount } from '@media/domain/media.entity';
import { MEDIA_REPOSITORY, MediaRepository } from '@media/domain/media.repository';

@Injectable()
export class ListMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: MediaRepository) {}

	async execute(): Promise<MediaWithCampaignCount[]> {
		return this.mediaRepository.findAllWithCampaignCount();
	}
}
