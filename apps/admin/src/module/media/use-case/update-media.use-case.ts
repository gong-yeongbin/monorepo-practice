import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IMedia, MEDIA_REPOSITORY } from '@module/media/domain';
import { UpdateMediaDto } from '@module/media/dto/request';
import { ResponseUpdateMediaDto } from '@module/media/dto/response';
import { MediaDto } from '@module/media/dto/media.dto';

@Injectable()
export class UpdateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute(id: number, request: UpdateMediaDto) {
		const { name, installPostbackUrl, eventPostbackUrl } = request;

		const media = await this.mediaRepository.findById(id);
		if (!media) throw new NotFoundException();

		const mediaDto = plainToInstance(MediaDto, { name, installPostbackUrl, eventPostbackUrl });
		const response = await this.mediaRepository.update(id, mediaDto);

		const responseUpdateMediaDto = plainToInstance(ResponseUpdateMediaDto, response);

		return {
			data: responseUpdateMediaDto,
		};
	}
}
