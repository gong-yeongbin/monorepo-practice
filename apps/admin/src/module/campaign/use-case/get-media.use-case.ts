import { Inject, Injectable } from '@nestjs/common';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';
import { IMedia } from '@media/domain/repositories';

@Injectable()
export class GetMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute(mediaId: number): Promise<string | null> {
		const media = await this.mediaRepository.findById(mediaId);
		return media ? media.name : null;
	}
}
