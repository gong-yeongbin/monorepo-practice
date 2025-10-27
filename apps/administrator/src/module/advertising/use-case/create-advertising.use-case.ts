import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateAdvertisingDto } from '@module/advertising/dto/request';
import { ResponseCreateAdvertisingDto } from '@module/advertising/dto/response';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';

@Injectable()
export class CreateAdvertisingUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser
	) {}

	async execute(request: CreateAdvertisingDto) {
		const { name, image, advertiserName } = request;

		const advertiser = await this.advertiserRepository.find(advertiserName);
		if (!advertiser) throw new NotFoundException();

		const advertising = await this.advertisingRepository.findByName(name);
		if (advertising) throw new ConflictException();

		const advertisingDto = plainToInstance(AdvertisingDto, { name, image, advertiser_name: advertiserName });
		const result = await this.advertisingRepository.create(advertisingDto);

		return {
			data: plainToInstance(ResponseCreateAdvertisingDto, result),
		};
	}
}
