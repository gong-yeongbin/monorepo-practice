import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseAdvertiserListDto } from '@module/advertiser/dto/response';

@Injectable()
export class GetAdvertiserListUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute() {
		const advertisers = await this.advertiserRepository.findMany();
		return advertisers.map((advertiser) => plainToInstance(ResponseAdvertiserListDto, advertiser));
	}
}
