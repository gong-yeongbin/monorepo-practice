// media 도메인 타입(DB 컬럼과 동일한 snake_case)
export interface Media {
	id: number;
	name: string;
	install_postback_url: string;
	event_postback_url: string;
}

// 목록 조회용. campaign은 연결된 캠페인 개수(admin 원본의 loadRelationCountAndMap 대응)
export interface MediaWithCampaignCount extends Media {
	campaign: number;
}
