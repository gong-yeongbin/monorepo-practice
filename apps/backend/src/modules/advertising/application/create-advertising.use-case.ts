// tracker·advertiser 검증 후 advertising을 생성하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Advertising } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';

@Injectable()
export class CreateAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(dto: CreateAdvertisingDto): Promise<Advertising> {
		if (!(await this.advertisingRepository.trackerExists(dto.tracker_id))) {
			throw new NotFoundException('not found tracker');
		}
		if (!(await this.advertisingRepository.advertiserExists(dto.advertiser_id))) {
			throw new NotFoundException('not found advertiser');
		}
		if (await this.advertisingRepository.findByName(dto.name)) {
			throw new ConflictException('already exists advertising name');
		}

		return this.advertisingRepository.create({
			name: dto.name,
			image: dto.image ?? null,
			advertiser_id: dto.advertiser_id,
			tracker_id: dto.tracker_id,
		});
	}
}
