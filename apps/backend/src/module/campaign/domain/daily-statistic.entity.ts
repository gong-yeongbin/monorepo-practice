export class DailyStatistic {
	view_code: string;
	token: string;
	pub_id: string | null;
	sub_id: string | null;
	click: number = 0;
	install: number = 0;
	registration: number = 0;
	retention: number = 0;
	purchase: number = 0;
	revenue: number = 0;
	etc1: number = 0;
	etc2: number = 0;
	etc3: number = 0;
	etc4: number = 0;
	etc5: number = 0;
	unregistered: number = 0;
	created_date: Date;

	constructor(props: { view_code: string; token: string; pub_id: string | null; sub_id: string | null; click?: number; created_date: Date }) {
		this.view_code = props.view_code;
		this.token = props.token;
		this.pub_id = props.pub_id;
		this.sub_id = props.sub_id;
		this.click = props.click ?? 0;
		this.created_date = props.created_date;
	}
}
