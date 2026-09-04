// TRACKERS 레지스트리의 install·event 매퍼가 트래커별 viewCode 파라미터를 저장용 원문으로 정규화하는지 검증
import { TRACKERS } from './tracker.registry';

// 트래커별 viewCode가 실려 오는 쿼리 파라미터명
const VIEW_CODE_PARAM: Record<string, string> = {
	appsflyer: 'af_siteid',
	airbridge: 'sub_id',
	adjust: 'publisher_id',
	'adbrix-remaster': 'cb_2',
	singular: 'sub2',
};

describe('TRACKERS viewCode 매핑', () => {
	const plain = 'yiBlMXo/DLnd+YRE2M+kHMeMCirMulkeEtpOYf0oH5hm4kcHIdZMCJbMwnT+Sh8t=';
	// 트래커가 클릭 당시 받은 인코딩값을 다시 URL 인코딩해 보내면 Express 디코드 후 이 형태로 남는다
	const encoded = encodeURIComponent(plain);

	it.each(Object.entries(VIEW_CODE_PARAM))('%s: install·event 매퍼는 인코딩값도 원문도 원문으로 정규화한다', (name, param) => {
		for (const map of [TRACKERS[name]!.install, TRACKERS[name]!.event]) {
			expect(map({ [param]: encoded }).viewCode).toBe(plain);
			expect(map({ [param]: plain }).viewCode).toBe(plain);
		}
	});

	it('배열로 들어오면 첫 값을 정규화한다', () => {
		expect(TRACKERS.appsflyer!.install({ af_siteid: [encoded, 'other'] } as unknown as Record<string, string>).viewCode).toBe(plain);
	});
});
