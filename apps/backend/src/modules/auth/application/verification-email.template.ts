// 가입 인증 코드 메일의 제목·텍스트·HTML 본문을 생성하는 순수 템플릿 함수
export interface VerificationEmail {
	subject: string;
	text: string;
	html: string;
}

const SERVICE_NAME = 'mecrosspro';

export function buildVerificationEmail(code: string): VerificationEmail {
	const subject = `[${SERVICE_NAME}] 이메일 인증 코드`;

	const text = [`[${SERVICE_NAME}] 이메일 인증 코드`, '', `인증 코드: ${code}`, '', '이 코드는 10분 후 만료됩니다.', '본인이 요청하지 않았다면 이 메일을 무시해 주세요.'].join('\n');

	const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
	<tr>
		<td align="center">
			<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;padding:40px;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
				<tr>
					<td style="font-size:16px;font-weight:bold;color:#111111;padding-bottom:24px;">${SERVICE_NAME}</td>
				</tr>
				<tr>
					<td style="font-size:22px;font-weight:bold;color:#111111;padding-bottom:8px;">이메일 인증 코드</td>
				</tr>
				<tr>
					<td style="font-size:14px;color:#555555;padding-bottom:24px;">아래 코드를 입력해 주세요.</td>
				</tr>
				<tr>
					<td align="center" style="background-color:#f4f5f7;border-radius:6px;padding:20px 0;">
						<span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111111;">${code}</span>
					</td>
				</tr>
				<tr>
					<td style="font-size:13px;color:#888888;padding-top:24px;">이 코드는 10분 후 만료됩니다.</td>
				</tr>
				<tr>
					<td style="font-size:13px;color:#888888;padding-top:8px;">본인이 요청하지 않았다면 이 메일을 무시해 주세요.</td>
				</tr>
			</table>
		</td>
	</tr>
</table>`;

	return { subject, text, html };
}
