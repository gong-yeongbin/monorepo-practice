import { ConflictException, Injectable } from '@nestjs/common';
import { AdvertiserRepository } from '../domain';
import { plainToInstance } from 'class-transformer';
import { ResponseCreateAdvertiserDto } from '../dto/response';

@Injectable()
export class CreateAdvertiserUseCase {
	constructor(private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(name: string) {
		const advertiser = await this.advertiserRepository.findByName(name);
		if (advertiser) throw new ConflictException();

		const response = await this.advertiserRepository.create(name);
		const responseCreateAdvertiserDto = plainToInstance(ResponseCreateAdvertiserDto, { id: response.id, name: response.name });

		return {
			data: responseCreateAdvertiserDto,
		};
	}
}
