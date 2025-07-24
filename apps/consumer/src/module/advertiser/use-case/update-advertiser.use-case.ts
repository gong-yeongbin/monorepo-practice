import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAdvertiserDto } from '../dto/request';
import { AdvertiserRepository } from '../domain';
import { ResponseUpdateAdvertiserDto } from '../dto/response';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateAdvertiserUseCase {
	constructor(private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(id: number, request: UpdateAdvertiserDto) {
		const advertiser = await this.advertiserRepository.findById(id);
		if (!advertiser) throw new NotFoundException();

		const isDuplicateName = await this.advertiserRepository.findByName(request.name);
		if (request.name != advertiser.name && isDuplicateName) throw new ConflictException();

		const response = await this.advertiserRepository.update(id, request.name);
		const responseUpdateAdvertiserDto = plainToInstance(ResponseUpdateAdvertiserDto, { id: response.id, name: response.name });

		return {
			data: responseUpdateAdvertiserDto,
		};
	}
}
