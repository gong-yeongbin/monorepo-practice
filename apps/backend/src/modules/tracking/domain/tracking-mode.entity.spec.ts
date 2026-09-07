import { DEFAULT_TRACKING_MODE, parseTrackingMode, TRACKING_MODES } from '@tracking/domain/tracking-mode.entity';

describe('parseTrackingMode', () => {
	it.each(TRACKING_MODES)('알려진 모드 %s는 그대로 반환한다', (mode) => {
		expect(parseTrackingMode(mode)).toBe(mode);
	});

	it.each([null, undefined, '', 'OPEN', 'blocked', '2'])('알 수 없는 값(%s)은 기본값으로 열어둔다', (value) => {
		expect(parseTrackingMode(value)).toBe(DEFAULT_TRACKING_MODE);
	});

	it('기본값은 open이다 — 플래그를 못 읽었다고 트래킹을 멈추지 않는다', () => {
		expect(DEFAULT_TRACKING_MODE).toBe('open');
	});
});
