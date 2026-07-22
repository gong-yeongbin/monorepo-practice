// advertising 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { Advertising, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';

export class AdvertisingResponse implements Advertising {
	id: number;

	name: string;

	image: string | null;

	advertiser_id: number;

	tracker_id: number;
}

export class AdvertisingListItemResponse extends AdvertisingResponse implements AdvertisingListItem {
	tracker: string;

	// 연결된 campaign 개수
	campaign: number;

	// 활성 campaign이 1개 이상이면 true
	status: boolean;
}

export class AdvertisingInfoResponse implements AdvertisingInfo {
	advertiser: string;

	tracker: string;

	advertising: string;

	image: string | null;

	// 연결된 media 이름 목록
	media: string[];
}
