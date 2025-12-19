import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { CreateAdvertiserDto } from '@module/advertiser/dto/create-advertiser.dto';
import { Advertiser } from '@module/advertiser/dto/response';
import { UpdateAdvertiserInput } from '@module/advertiser/dto/request';

@Injectable()
export class UpdateAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute(input: UpdateAdvertiserInput) {
		const { id, name } = input;

		const advertiser = plainToInstance(CreateAdvertiserDto, { id, name }, { enableImplicitConversion: true });
		const response = await this.advertiserRepository.update(advertiser);
		return plainToInstance(Advertiser, response);
	}
}
