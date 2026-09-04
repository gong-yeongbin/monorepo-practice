// viewCodeCodec의 encode/decode 왕복·실패 시 입력 반환과 normalizeViewCode의 저장용 디코드 동작을 검증
import { normalizeViewCode, viewCodeCodec } from './view-code.util';

describe('viewCodeCodec', () => {
	it('encode는 IV가 고정이라 같은 평문에서 항상 같은 값을 낸다', () => {
		const plain = '2a3429e4b13c45f7baad77515e5bd798:1184:10730';

		expect(viewCodeCodec.encode(plain)).toBe('hUI5jhh963QZj1duCm5YieyTXqejPEVTDe8QPlmRH6qAlbNuqVgnnz7wjpYEWsIN');
	});

	it('decode는 encode 결과를 평문으로 되돌린다', () => {
		const plain = '2a3429e4b13c45f7baad77515e5bd798:1184:10730';

		expect(viewCodeCodec.decode(viewCodeCodec.encode(plain))).toBe(plain);
	});

	// 레거시 postback_install_singular에 한글 sub_id가 실재한다(예: '당당한토끼_4674').
	// decode가 'binary'(latin1)로 받던 시절에는 'ë¹ë¹íí ë¼_4674'로 깨졌다.
	it('decode는 한글 sub_id를 깨뜨리지 않는다', () => {
		const plain = 'b4a982683f334b4f840caa34b3a891c9:A958fQgQHB:당당한토끼_4674';

		expect(viewCodeCodec.decode(viewCodeCodec.encode(plain))).toBe(plain);
	});

	it('pubId·subId가 빈 문자열이어도 왕복한다', () => {
		const plain = '2a3429e4b13c45f7baad77515e5bd798::';

		expect(viewCodeCodec.decode(viewCodeCodec.encode(plain))).toBe(plain);
	});

	// use-case는 decode 결과를 그대로 split(':')하므로 실패가 throw로 새어나가면 안 된다
	it('decode는 복호화할 수 없는 값이면 입력을 그대로 반환한다', () => {
		const legacyHex = '2a3429e4b13c45f7baad77515e5bd798';

		expect(viewCodeCodec.decode(legacyHex)).toBe(legacyHex);
	});
});

describe('normalizeViewCode', () => {
	it('encode 결과의 percent-encoding을 풀어 base64 원문으로 되돌린다', () => {
		const encoded = 'yiBlMXo%2FDLnd%2BYRE2M%2BkHMeMCirMulkeEtpOYf0oH5hm4kcHIdZMCJbMwnT%2BSh8t%3D';

		expect(normalizeViewCode(encoded)).toBe('yiBlMXo/DLnd+YRE2M+kHMeMCirMulkeEtpOYf0oH5hm4kcHIdZMCJbMwnT+Sh8t=');
	});

	it('이미 원문이면 그대로 둔다', () => {
		const plain = 'yiBlMXo/DLnd+YRE2M+kHMeMCirMulkeEtpOYf0oH5hm4kcHIdZMCJbMwnT+Sh8t=';

		expect(normalizeViewCode(plain)).toBe(plain);
	});

	it('원문을 decode하면 encode 전 평문이 나온다', () => {
		const plain = '2a3429e4b13c45f7baad77515e5bd798:1184:10730';

		expect(viewCodeCodec.decode(normalizeViewCode(viewCodeCodec.encode(plain)))).toBe(plain);
	});

	// 공개 포스트백 엔드포인트라 트래커가 보낸 이상값으로 500이 나면 안 된다
	it('잘못된 percent 시퀀스면 던지지 않고 입력을 그대로 반환한다', () => {
		expect(normalizeViewCode('bad%E0%A4%A')).toBe('bad%E0%A4%A');
	});
});
