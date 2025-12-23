import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IMedia, MEDIA_REPOSITORY } from '@module/media/domain';
import { UpdateMediaInput } from '@module/media/dto/request';
import { UpdateMediaDto } from '@module/media/dto';
import { Media } from '@module/media/dto/response';

@Injectable()
export class UpdateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute(input: UpdateMediaInput) {
		const { id, name, installPostbackUrl, eventPostbackUrl } = input;

		const media = await this.mediaRepository.findById(id);
		if (!media) throw new NotFoundException();

		const updateMediaDto = plainToInstance(UpdateMediaDto, { id, name, installPostbackUrl, eventPostbackUrl });
		const response = await this.mediaRepository.update(updateMediaDto);

		return plainToInstance(Media, response, { excludeExtraneousValues: true });
	}
}
