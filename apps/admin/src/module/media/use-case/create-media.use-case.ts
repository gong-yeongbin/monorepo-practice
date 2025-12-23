import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateMediaInput } from '@module/media/dto/request';
import { Media } from '@module/media/dto/response';
import { IMedia, MEDIA_REPOSITORY } from '@module/media/domain';
import { CreateMediaDto } from '@module/media/dto';

@Injectable()
export class CreateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia) {}

	async execute(input: CreateMediaInput) {
		const { name, installPostbackUrl, eventPostbackUrl } = input;

		const media = await this.mediaRepository.findByName(name);
		if (media) throw new ConflictException();

		const createMedia = plainToInstance(CreateMediaDto, { name, installPostbackUrl, eventPostbackUrl });
		const response = await this.mediaRepository.create(createMedia);

		return plainToInstance(Media, response, { excludeExtraneousValues: true });
	}
}
