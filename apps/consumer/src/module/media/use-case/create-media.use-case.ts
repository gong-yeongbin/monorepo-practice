import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from '../dto/request';
import { MediaRepository } from '../domain';
import { plainToInstance } from 'class-transformer';
import { MediaDto } from '../shared/dto';
import { ResponseCreateMediaDto } from '../dto/response';

@Injectable()
export class CreateMediaUseCase {
	constructor(private readonly mediaRepository: MediaRepository) {}

	async execute(request: CreateMediaDto) {
		const { name, installPostbackUrl, eventPostbackUrl } = request;

		const media = await this.mediaRepository.findByName(name);
		if (media) throw new ConflictException();

		const mediaDto = plainToInstance(MediaDto, { name: name, install_postback_url: installPostbackUrl, event_postback_url: eventPostbackUrl });
		const response = await this.mediaRepository.create(mediaDto);

		const responseCreateMediaDto = plainToInstance(ResponseCreateMediaDto, {
			id: response.id,
			name: response.name,
			installPostbackUrl: response.install_postback_url,
			eventPostbackUrl: response.event_postback_url,
		});

		return {
			data: responseCreateMediaDto,
		};
	}
}
