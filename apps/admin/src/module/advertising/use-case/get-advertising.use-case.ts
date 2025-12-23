import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Advertising } from '@advertising/dto/response';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(id: number) {
		const advertising = await this.advertisingRepository.findById(id);
		if (!advertising) throw new NotFoundException();

		console.log(advertising);
		return plainToInstance(Advertising, advertising, { excludeExtraneousValues: true });
	}
}
