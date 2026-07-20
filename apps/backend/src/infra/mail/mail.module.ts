// SES 클라이언트와 MailPort 바인딩을 캡슐화하는 메일 인프라 모듈
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient } from '@aws-sdk/client-ses';
import { MAIL_PORT } from '@infra/mail/mail.port';
import { SES_CLIENT } from '@infra/mail/mail.constants';
import { SesMailAdapter } from '@infra/mail/ses-mail.adapter';

@Module({
	providers: [
		{
			provide: SES_CLIENT,
			inject: [ConfigService],
			// 자격 증명은 SDK 기본 credential chain(AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY 환경 변수)을 쓴다
			useFactory: (configService: ConfigService) => new SESClient({ region: configService.get<string>('AWS_REGION') }),
		},
		{ provide: MAIL_PORT, useClass: SesMailAdapter },
	],
	exports: [MAIL_PORT],
})
export class MailModule {}
