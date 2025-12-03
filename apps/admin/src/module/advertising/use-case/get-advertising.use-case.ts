import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseGetAdvertisingDto } from '@advertising/dto/response/response-get-advertising.dto';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@advertising/domain';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(name: string) {
		const advertising = await this.advertisingRepository.findByName(name);
		return plainToInstance(ResponseGetAdvertisingDto, advertising, { excludeExtraneousValues: true });
	}
}
