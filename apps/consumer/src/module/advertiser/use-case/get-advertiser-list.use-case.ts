import { Injectable } from '@nestjs/common';
import { AdvertiserRepository } from '../domain';
import { ResponseAdvertiserListDto } from '../dto/response';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GetAdvertiserListUseCase {
	constructor(private readonly advertiserRepository: AdvertiserRepository) {}

	async execute() {
		const advertisers = await this.advertiserRepository.findMany();

		const responseAdvertiserListDto = advertisers.map((advertiser) => plainToInstance(ResponseAdvertiserListDto, { id: advertiser.id, name: advertiser.name }));
		return {
			data: responseAdvertiserListDto,
		};
	}
}
