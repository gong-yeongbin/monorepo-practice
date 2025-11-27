import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { plainToInstance } from 'class-transformer';
import { ResponseGetCampaignListDto } from '@module/advertising/dto/response';

@Injectable()
export class GetCampaignListUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(id: number) {
		const advertising = await this.advertisingRepository.findById(id);
		if (!advertising) throw new NotFoundException();

		const result = await this.advertisingRepository.findManyCampaign(id);
		return {
			data: result?.campaign?.map((advertising) => plainToInstance(ResponseGetCampaignListDto, advertising, { excludeExtraneousValues: true })),
		};
	}
}
