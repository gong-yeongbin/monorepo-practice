// media 단건을 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Media } from '@media/domain/media.entity';
import { MEDIA_REPOSITORY, MediaRepository } from '@media/domain/media.repository';

@Injectable()
export class GetMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: MediaRepository) {}

	async execute(id: number): Promise<Media> {
		const media = await this.mediaRepository.findById(id);
		if (!media) {
			throw new NotFoundException();
		}

		return media;
	}
}
