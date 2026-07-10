// advertising 도메인 타입(DB 컬럼과 동일한 snake_case)
export interface Advertising {
	id: number;
	name: string;
	image: string | null;
	advertiser_id: number;
	tracker_id: number;
}

// 목록 응답: campaign 활성 개수와 파생 status(활성 campaign 1개 이상이면 true)를 덧붙인다
export interface AdvertisingListItem extends Advertising {
	campaign: number;
	status: boolean;
}

// 간략 목록 응답(admin getAdvertisingList): tracker명 포함
export interface AdvertisingBrief {
	id: number;
	name: string;
	image: string | null;
	tracker: string;
}

// 정보 조회(admin getAdvertisingInfo): advertiser·tracker·연결된 media 목록
export interface AdvertisingInfo {
	advertiser: string;
	tracker: string;
	advertising: string;
	image: string | null;
	media: string[];
}
