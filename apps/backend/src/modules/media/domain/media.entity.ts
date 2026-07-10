// media 도메인 타입. campaign은 연결된 캠페인 개수(admin 원본의 loadRelationCountAndMap 대응)
export interface MediaWithCampaignCount {
	id: number;
	name: string;
	install_postback_url: string;
	event_postback_url: string;
	campaign: number;
}
