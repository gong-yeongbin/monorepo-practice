// 이름 중복을 검사하고 advertiser를 생성하는 use-case
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Advertiser } from '@advertiser/domain/advertiser.entity';
import { ADVERTISER_REPOSITORY, AdvertiserRepository } from '@advertiser/domain/advertiser.repository';
import { CreateAdvertiserDto } from '@advertiser/application/dto/create-advertiser.dto';

@Injectable()
export class CreateAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(dto: CreateAdvertiserDto): Promise<Advertiser> {
		const existing = await this.advertiserRepository.findByName(dto.name);
		if (existing) {
			throw new ConflictException('already exists advertiser name');
		}

		return this.advertiserRepository.create(dto.name);
	}
}
