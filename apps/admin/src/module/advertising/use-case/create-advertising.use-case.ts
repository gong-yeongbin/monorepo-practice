import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateAdvertisingInput } from '@module/advertising/dto/request';
import { Advertising } from '@module/advertising/dto/response';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { CreateAdvertisingDto } from '@advertising/dto';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';
import { ITracker } from '@module/tracker/domain/repositories';

@Injectable()
export class CreateAdvertisingUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser,
		@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker
	) {}

	async execute(input: CreateAdvertisingInput) {
		const { name, image, advertiserName, trackerName } = input;

		const advertiser = await this.advertiserRepository.find(advertiserName);
		const tracker = await this.trackerRepository.findByName(trackerName);
		if (!advertiser || !tracker) throw new NotFoundException();

		const advertising = await this.advertisingRepository.findByName(name);
		if (advertising) throw new ConflictException();

		const createAdvertisingDto = plainToInstance(CreateAdvertisingDto, { name, image, advertiserName, trackerName }, { excludeExtraneousValues: true });
		const result = await this.advertisingRepository.create(createAdvertisingDto);

		return plainToInstance(Advertising, result, { excludeExtraneousValues: true });
	}
}
