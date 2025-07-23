import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMediaDto } from '../dto/request';
import { MediaRepository } from '../domain';
import { plainToInstance } from 'class-transformer';
import { MediaDto } from '../shared/dto';
import { ResponseCreateMediaDto, ResponseUpdateMediaDto } from '../dto/response';

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
