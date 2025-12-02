import { Inject, Injectable } from '@nestjs/common';
import { IMedia, MEDIA_REPOSITORY } from '@module/media/domain';
import { plainToInstance } from 'class-transformer';
import { ResponseGetMediaListDto } from '@module/media/dto/response';

@Injectable()
export class GetMediaListUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute() {
		const mediaList = await this.mediaRepository.findMany();
		return mediaList?.map((media) => plainToInstance(ResponseGetMediaListDto, media, { excludeExtraneousValues: true }));
	}
}
