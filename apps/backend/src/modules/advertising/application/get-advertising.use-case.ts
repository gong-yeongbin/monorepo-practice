// advertising 정보(advertiser·tracker·연결 media)를 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AdvertisingInfo } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { AdvertisingScope, isAdvertisingAllowed } from '@auth/application/advertising-scope';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(id: number, scope: AdvertisingScope): Promise<AdvertisingInfo> {
		// 허용 목록 밖 광고는 존재 여부도 노출하지 않는다. 403이 아니라 404인 이유는
		// 프론트 QueryCache.onError가 403을 세션 만료로 보고 로그아웃시키기 때문이다.
		if (!isAdvertisingAllowed(scope, id)) {
			throw new NotFoundException();
		}

		const info = await this.advertisingRepository.get(id);
		if (!info) {
			throw new NotFoundException();
		}

		return info;
	}
}
