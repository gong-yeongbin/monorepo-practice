export class CampaignConfig {
	id: number;
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
	campaign_id: number;

	constructor(props: { id: number; send_media: boolean; tracker_event_name: string; admin_event_name: string; media_event_name: string; campaign_id: number }) {
		this.id = props.id;
		this.send_media = props.send_media;
		this.tracker_event_name = props.tracker_event_name;
		this.admin_event_name = props.admin_event_name;
		this.media_event_name = props.media_event_name;
		this.campaign_id = props.campaign_id;
	}
}
