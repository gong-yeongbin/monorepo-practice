// singular 트래킹 링크 매크로로 내보낼 값을 만드는 매퍼
import { Expose, Transform } from 'class-transformer';

export class SingularTracking {
	@Expose()
	idfa: string;

	@Expose({ name: 'adid' })
	gaid: string;

	@Expose({ name: 'clickId' })
	click_id: string;

	@Expose()
	token: string;

	@Expose({ name: 'viewCode' })
	view_code: string;

	// singular 포스트백은 cl을 되돌려주지 않는다 — 클릭 식별자를 sub3로도 실어 보내 포스트백에서 되받는다.
	// 같은 name을 두 프로퍼티에 노출하면 한쪽만 채워지므로 obj에서 직접 꺼낸다.
	@Expose()
	@Transform(({ obj }) => obj.clickId)
	sub3: string;
}
