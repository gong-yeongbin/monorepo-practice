// 인증 코드 메일 템플릿의 제목·텍스트·HTML 구성을 검증
import { buildVerificationEmail } from './verification-email.template';

describe('buildVerificationEmail', () => {
	const email = buildVerificationEmail('382917');

	it('제목에 서비스명을 담는다', () => {
		expect(email.subject).toBe('[mecrosspro] 이메일 인증 코드');
	});

	it('텍스트 본문에 코드·만료 안내·미요청 안내를 담는다', () => {
		expect(email.text).toContain('382917');
		expect(email.text).toContain('10분 후 만료');
		expect(email.text).toContain('무시해 주세요');
	});

	it('HTML 본문에 서비스명·코드·만료 안내·미요청 안내를 담는다', () => {
		expect(email.html).toContain('mecrosspro');
		expect(email.html).toContain('382917');
		expect(email.html).toContain('10분 후 만료');
		expect(email.html).toContain('무시해 주세요');
	});
});
