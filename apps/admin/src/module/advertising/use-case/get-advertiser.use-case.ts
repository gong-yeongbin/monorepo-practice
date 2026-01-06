import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/symbol';
import { IAdvertiser } from '@advertiser/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { Advertiser } from '@advertiser/dto/response';

@Injectable()
export class GetAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute(advertiserId: number) {
		const advertiser = await this.advertiserRepository.findById(advertiserId);
		return plainToInstance(Advertiser, advertiser, { excludeExtraneousValues: true });
	}
}
