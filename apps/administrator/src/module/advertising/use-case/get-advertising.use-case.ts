import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { plainToInstance } from 'class-transformer';
import { ResponseGetAdvertisingListDto } from '@module/advertising/dto/response/response-get-advertising-list.dto';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute() {
		const advertisings = await this.advertisingRepository.findMany();
		return {
			data: advertisings.map((advertising) => plainToInstance(ResponseGetAdvertisingListDto, advertising, { excludeExtraneousValues: true })),
		};
	}
}
