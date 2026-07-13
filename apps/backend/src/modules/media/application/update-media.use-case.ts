// 존재·이름 중복을 검사하고 media를 전체 교체 수정하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Media } from '@media/domain/media.entity';
import { MEDIA_REPOSITORY, MediaRepository } from '@media/domain/media.repository';
import { UpdateMediaDto } from '@media/application/dto/update-media.dto';

@Injectable()
export class UpdateMediaUseCase {
	constructor(@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: MediaRepository) {}

	async execute(id: number, dto: UpdateMediaDto): Promise<Media> {
		if (!(await this.mediaRepository.findById(id))) {
			throw new NotFoundException();
		}

		// 이름을 다른 media가 이미 쓰고 있으면 충돌(자기 자신은 허용)
		const sameName = await this.mediaRepository.findByName(dto.name);
		if (sameName && sameName.id !== id) {
			throw new ConflictException('already exists media name');
		}

		return this.mediaRepository.update(id, {
			name: dto.name,
			install_postback_url: dto.install_postback_url,
			event_postback_url: dto.event_postback_url,
		});
	}
}
