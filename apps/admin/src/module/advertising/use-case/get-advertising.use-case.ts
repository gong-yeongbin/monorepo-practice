import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseGetAdvertisingDto } from '@advertising/dto/response/response-get-advertising.dto';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@advertising/domain';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(advertisingId: number) {
		const advertising = await this.advertisingRepository.findManyCampaign(advertisingId);
		return plainToInstance(ResponseGetAdvertisingDto, advertising);
	}
}
