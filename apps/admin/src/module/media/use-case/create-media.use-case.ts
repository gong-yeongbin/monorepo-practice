import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateMediaDto } from '@module/media/dto/request';
import { ResponseCreateMediaDto } from '@module/media/dto/response';
import { IMedia, MEDIA_REPOSITORY } from '@module/media/domain';
import { MediaDto } from '@module/media/dto/media.dto';

@Injectable()
export class CreateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute(request: CreateMediaDto) {
		const { name, installPostbackUrl, eventPostbackUrl } = request;

		const media = await this.mediaRepository.findByName(name);
		if (media) throw new ConflictException();

		const mediaDto = plainToInstance(MediaDto, { name, installPostbackUrl, eventPostbackUrl });
		const response = await this.mediaRepository.create(mediaDto);

		const responseCreateMediaDto = plainToInstance(ResponseCreateMediaDto, response);

		return {
			data: responseCreateMediaDto,
		};
	}
}
