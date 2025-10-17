import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MediaRepository } from '@module/media/domain';
import { UpdateMediaDto } from '@module/media/dto/request';
import { MediaDto } from '@module/media/shared/dto';
import { ResponseUpdateMediaDto } from '@module/media/dto/response';

@Injectable()
export class UpdateMediaUseCase {
	constructor(private readonly mediaRepository: MediaRepository) {}

	async execute(id: number, request: UpdateMediaDto) {
		const { name, installPostbackUrl, eventPostbackUrl } = request;

		const media = await this.mediaRepository.findById(id);
		if (!media) throw new NotFoundException();

		const mediaDto = plainToInstance(MediaDto, { name: name, install_postback_url: installPostbackUrl, event_postback_url: eventPostbackUrl });
		const response = await this.mediaRepository.update(id, mediaDto);
		const responseUpdateMediaDto = plainToInstance(ResponseUpdateMediaDto, {
			id: response.id,
			name: response.name,
			installPostbackUrl: response.install_postback_url,
			eventPostbackUrl: response.event_postback_url,
		});

		return {
			data: responseUpdateMediaDto,
		};
	}
}
