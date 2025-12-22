import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Advertising } from '@advertising/dto/response';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';

@Injectable()
export class GetAdvertisingListUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute() {
		const advertisings = await this.advertisingRepository.findMany();
		return advertisings.map((advertising) => plainToInstance(Advertising, advertising));
	}
}
