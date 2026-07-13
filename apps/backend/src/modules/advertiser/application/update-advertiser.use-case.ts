// 존재·이름 중복을 검사하고 advertiser 이름을 수정하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Advertiser } from '@advertiser/domain/advertiser.entity';
import { ADVERTISER_REPOSITORY, AdvertiserRepository } from '@advertiser/domain/advertiser.repository';
import { CreateAdvertiserDto } from '@advertiser/application/dto/create-advertiser.dto';

@Injectable()
export class UpdateAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(id: number, dto: CreateAdvertiserDto): Promise<Advertiser> {
		if (!(await this.advertiserRepository.findById(id))) {
			throw new NotFoundException();
		}

		// 이름을 다른 advertiser가 이미 쓰고 있으면 충돌(자기 자신은 허용)
		const sameName = await this.advertiserRepository.findByName(dto.name);
		if (sameName && sameName.id !== id) {
			throw new ConflictException('already exists advertiser name');
		}

		return this.advertiserRepository.update(id, dto.name);
	}
}
