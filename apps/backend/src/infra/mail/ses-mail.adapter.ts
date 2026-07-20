// AWS SES로 메일을 발송하는 MailPort 어댑터
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { MailPort } from '@infra/mail/mail.port';
import { SES_CLIENT } from '@infra/mail/mail.constants';

@Injectable()
export class SesMailAdapter implements MailPort {
	constructor(
		@Inject(SES_CLIENT) private readonly ses: SESClient,
		private readonly configService: ConfigService
	) {}

	async send(to: string, subject: string, body: string): Promise<void> {
		await this.ses.send(
			new SendEmailCommand({
				Source: this.configService.get<string>('SES_FROM_EMAIL'),
				Destination: { ToAddresses: [to] },
				Message: {
					Subject: { Data: subject, Charset: 'UTF-8' },
					Body: { Text: { Data: body, Charset: 'UTF-8' } },
				},
			})
		);
	}
}
