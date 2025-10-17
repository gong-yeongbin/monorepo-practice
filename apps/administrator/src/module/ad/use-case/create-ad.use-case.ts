import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AdRepository } from '@module/ad/domain';
import { CreateAdDto } from '@module/ad/dto/request';
import { AdDto } from '@module/ad/shared/dto';
import { ResponseCreateAdDto } from '@module/ad/dto/response';

@Injectable()
export class CreateAdUseCase {
	constructor(private readonly adRepository: AdRepository) {}

	async execute(request: CreateAdDto) {
		const { name, image, advertiserName } = request;

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
