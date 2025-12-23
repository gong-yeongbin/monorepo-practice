import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';
import { IMedia } from '@media/domain/repositories';
import { CreateMediaInput } from '@media/dto/request';
import { CreateMediaDto } from '@media/dto';
import { Media } from '@media/dto/response';

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
