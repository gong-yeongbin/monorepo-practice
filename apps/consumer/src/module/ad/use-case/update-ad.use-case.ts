import { Injectable, NotFoundException } from '@nestjs/common';
import { AdRepository } from '../domain';
import { UpdateAdDto } from '../dto/request';
import { plainToInstance } from 'class-transformer';
import { AdDto } from '../shared/dto';
import { ResponseUpdateAdDto } from '../dto/response';

@Injectable()
export class UpdateAdUseCase {
	constructor(private readonly adRepository: AdRepository) {}

	async execute(id: number, request: UpdateAdDto) {
		const ad = await this.adRepository.findById(id);
		if (!ad) throw new NotFoundException();

		const adDto = plainToInstance(AdDto, { name: request.name, image: request.image, advertiser_name: ad.advertiser_name });
		const response = await this.adRepository.update(id, adDto);

		const responseUpdateAdDto = plainToInstance(ResponseUpdateAdDto, { id: response.id, name: response.name, image: response.image, advertiserName: response.advertiser_name });
		return {
			data: responseUpdateAdDto,
		};
	}
}
