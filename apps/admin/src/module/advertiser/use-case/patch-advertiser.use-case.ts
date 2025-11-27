import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { AdvertiserDto } from '@module/advertiser/dto/advertiser.dto';
import { ResponseAdvertiserDto } from '@module/advertiser/dto/response';

@Injectable()
export class PatchAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: IAdvertiser) {}

	async execute(id: string, name: string) {
		const advertiser = plainToInstance(AdvertiserDto, { id, name }, { enableImplicitConversion: true });
		const result = await this.advertiserRepository.update(advertiser);
		return { data: plainToInstance(ResponseAdvertiserDto, result) };
	}
}
