import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateAdvertisingDto } from '@module/advertising/dto/request';
import { ResponseCreateAdvertisingDto } from '@module/advertising/dto/response';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { ITracker, TRACKER_REPOSITORY } from '@module/tracker/domain';

@Injectable()
export class CreateAdvertisingUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser,
		@Inject(TRACKER_REPOSITORY) private readonly trakcerRepository: ITracker
	) {}

	async execute(request: CreateAdvertisingDto) {
		const { name, image, advertiserName, trackerName } = request;

		const advertiser = await this.advertiserRepository.find(advertiserName);
		const tracker = await this.trakcerRepository.findByName(trackerName);
		if (!advertiser || !tracker) throw new NotFoundException();

		const advertising = await this.advertisingRepository.findByName(name);
		if (advertising) throw new ConflictException();

		const advertisingDto = plainToInstance(AdvertisingDto, { name, image, advertiser_name: advertiserName, tracker_name: trackerName });
		const result = await this.advertisingRepository.create(advertisingDto);

		return {
			data: plainToInstance(ResponseCreateAdvertisingDto, result),
		};
	}
}
