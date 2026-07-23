// 메일 발송 포트 인터페이스와 DI 토큰
export const MAIL_PORT = Symbol('MAIL_PORT');

export interface MailPort {
	send(to: string, subject: string, body: string, html?: string): Promise<void>;
}
