import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';
import { IMedia } from '@media/domain/repositories';
import { Media } from '@media/dto/response';

@Injectable()
export class GetMediaListUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute() {
		const mediaList = await this.mediaRepository.findMany();
		return mediaList.map((media) => plainToInstance(Media, media, { excludeExtraneousValues: true }));
	}
}
