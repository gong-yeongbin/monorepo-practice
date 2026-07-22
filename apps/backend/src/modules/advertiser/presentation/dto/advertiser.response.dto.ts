// advertiser 응답 스키마(Swagger 문서용). 도메인 Advertiser와 필드를 동일하게 유지한다
import { Advertiser } from '@advertiser/domain/advertiser.entity';

export class AdvertiserResponse implements Advertiser {
	id: number;

	name: string;
}
