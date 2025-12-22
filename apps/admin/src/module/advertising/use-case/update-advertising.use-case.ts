import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateAdvertisingDto } from '@advertising/dto';
import { UpdateAdvertisingInput } from '@advertising/dto/request';
import { Advertising } from '@advertising/dto/response';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';

@Injectable()
export class UpdateAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(input: UpdateAdvertisingInput) {
		const { id, image, name } = input;

		const advertising = await this.advertisingRepository.findById(id);
		if (!advertising) throw new NotFoundException();

		const updateAdvertisingDto = plainToInstance(UpdateAdvertisingDto, { ...advertising, name, image }, { excludeExtraneousValues: true });

		const result = await this.advertisingRepository.update(updateAdvertisingDto);

		return plainToInstance(Advertising, result, { excludeExtraneousValues: true });
	}
}
