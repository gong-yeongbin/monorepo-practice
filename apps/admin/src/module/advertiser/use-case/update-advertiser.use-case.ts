import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/symbol';
import { IAdvertiser } from '@advertiser/domain/repositories';
import { CreateAdvertiserDto } from '@advertiser/dto';
import { UpdateAdvertiserInput } from '@advertiser/dto/request';
import { Advertiser } from '@advertiser/dto/response';

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
