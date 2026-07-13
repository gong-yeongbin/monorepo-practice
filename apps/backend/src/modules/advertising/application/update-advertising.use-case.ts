// 존재·tracker·advertiser·이름 중복을 검사하고 advertising을 전체 교체 수정하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Advertising } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { UpdateAdvertisingDto } from '@advertising/application/dto/update-advertising.dto';

@Injectable()
export class UpdateAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(id: number, dto: UpdateAdvertisingDto): Promise<Advertising> {
		if (!(await this.advertisingRepository.exists(id))) {
			throw new NotFoundException();
		}
		if (!(await this.advertisingRepository.trackerExists(dto.tracker_id))) {
			throw new NotFoundException('not found tracker');
		}
		if (!(await this.advertisingRepository.advertiserExists(dto.advertiser_id))) {
			throw new NotFoundException('not found advertiser');
		}

		// 이름을 다른 advertising이 이미 쓰고 있으면 충돌(자기 자신은 허용)
		const sameName = await this.advertisingRepository.findByName(dto.name);
		if (sameName && sameName.id !== id) {
			throw new ConflictException('already exists advertising name');
		}

		return this.advertisingRepository.update(id, {
			name: dto.name,
			image: dto.image ?? null,
			advertiser_id: dto.advertiser_id,
			tracker_id: dto.tracker_id,
		});
	}
}
