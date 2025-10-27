import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateAdvertisingDto } from '@module/advertising/dto/request';
import { ResponseUpdateAdvertisingDto } from '@module/advertising/dto/response';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';

@Injectable()
export class UpdateAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(id: number, request: UpdateAdvertisingDto) {
		const { image, name } = request;

		const advertising = await this.advertisingRepository.findById(id);
		if (!advertising) throw new NotFoundException();

		const advertisingDto = plainToInstance(AdvertisingDto, advertising);
		advertisingDto.name = name;
		advertisingDto.image = image;

		const result = await this.advertisingRepository.update(id, advertisingDto);

		return {
			data: plainToInstance(ResponseUpdateAdvertisingDto, result),
		};
	}
}
