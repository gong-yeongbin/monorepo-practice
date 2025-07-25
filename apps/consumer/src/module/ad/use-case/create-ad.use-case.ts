import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdDto } from '../dto/request';
import { AdvertiserRepository } from '../../advertiser/domain';
import { plainToInstance } from 'class-transformer';
import { AdRepository } from '../domain';
import { AdDto } from '../shared/dto';
import { ResponseCreateAdDto } from '../dto/response';

@Injectable()
export class CreateAdUseCase {
	constructor(
		private readonly advertiserRepository: AdvertiserRepository,
		private readonly adRepository: AdRepository
	) {}

	async execute(request: CreateAdDto) {
		const { name, image, advertiserName } = request;

		const advertiser = await this.advertiserRepository.findByName(advertiserName);
		if (!advertiser) throw new NotFoundException();

		const ad = await this.adRepository.findByName(name);
		if (ad) throw new ConflictException();

		const adDto = plainToInstance(AdDto, { name: name, image: image, advertiser_name: advertiserName });
		const response = await this.adRepository.create(adDto);

		const responseCreateAdDto = plainToInstance(ResponseCreateAdDto, { id: response.id, name: response.name, image: response.image, advertiserName: response.advertiser_name });
		return {
			data: responseCreateAdDto,
		};
	}
}
