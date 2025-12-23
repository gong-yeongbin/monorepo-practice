import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/symbol';
import { IAdvertiser } from '@advertiser/domain/repositories';
import { CreateAdvertiserInput } from '@advertiser/dto/request';
import { Advertiser } from '@advertiser/dto/response';

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
