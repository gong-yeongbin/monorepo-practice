// S3 클라이언트와 StoragePort 바인딩을 캡슐화하는 스토리지 인프라 모듈
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { STORAGE_PORT } from '@infra/storage/storage.port';
import { S3_CLIENT } from '@infra/storage/storage.constants';
import { S3StorageAdapter } from '@infra/storage/s3-storage.adapter';

@Module({
	providers: [
		{
			provide: S3_CLIENT,
			inject: [ConfigService],
			// 자격 증명은 SDK 기본 credential chain(AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY 환경 변수)을 쓴다
			useFactory: (configService: ConfigService) => new S3Client({ region: configService.get<string>('AWS_REGION') }),
		},
		{ provide: STORAGE_PORT, useClass: S3StorageAdapter },
	],
	exports: [STORAGE_PORT],
})
export class StorageModule {}
