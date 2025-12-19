import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { Advertiser } from '@module/advertiser/dto/response';
import { CreateAdvertiserInput } from '@module/advertiser/dto/request';

@Injectable()
export class CreateAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute(input: CreateAdvertiserInput) {
		const name = input.name;

		let advertiser = await this.advertiserRepository.find(name);
		if (advertiser) throw new ConflictException();

		advertiser = await this.advertiserRepository.create(name);
		return plainToInstance(Advertiser, advertiser);
	}
}
