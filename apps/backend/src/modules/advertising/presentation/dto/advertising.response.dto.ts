// advertising 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { Advertising, AdvertisingInfo, AdvertisingListItem, AdvertisingListPage } from '@advertising/domain/advertising.entity';

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

export class AdvertisingListPageResponse implements AdvertisingListPage {
	items: AdvertisingListItemResponse[];

	// 검색 조건에 맞는 전체 건수(페이지네이션 계산용)
	total: number;
}

export class AdvertisingImageResponse {
	// 업로드된 이미지의 공개 URL
	image: string;
}

export class AdvertisingInfoResponse implements AdvertisingInfo {
	advertiser: string;

	tracker: string;

	advertising: string;

	image: string | null;

	// 연결된 media 이름 목록
	media: string[];
}
