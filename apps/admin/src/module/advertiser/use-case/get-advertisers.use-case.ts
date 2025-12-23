import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/symbol';
import { IAdvertiser } from '@advertiser/domain/repositories';
import { Advertiser } from '@advertiser/dto/response';

@Injectable()
export class GetAdvertisersUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute() {
		const advertisers = await this.advertiserRepository.findMany();
		return advertisers.map((advertiser) => plainToInstance(Advertiser, advertiser));
	}
}
