// 이름 중복을 검사하고 media를 생성하는 use-case
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Media } from '@media/domain/media.entity';
import { MEDIA_REPOSITORY, MediaRepository } from '@media/domain/media.repository';
import { CreateMediaDto } from '@media/application/dto/create-media.dto';

@Injectable()
export class CreateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: MediaRepository) {}

	async execute(dto: CreateMediaDto): Promise<Media> {
		if (await this.mediaRepository.findByName(dto.name)) {
			throw new ConflictException('already exists media name');
		}

		return this.mediaRepository.create({
			name: dto.name,
			install_postback_url: dto.install_postback_url,
			event_postback_url: dto.event_postback_url,
		});
	}
}
