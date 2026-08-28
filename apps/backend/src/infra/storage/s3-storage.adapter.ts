// AWS S3에 파일을 업로드하는 StoragePort 어댑터
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StoragePort, UploadParams } from '@infra/storage/storage.port';
import { S3_CLIENT } from '@infra/storage/storage.constants';

@Injectable()
export class S3StorageAdapter implements StoragePort {
	constructor(
		@Inject(S3_CLIENT) private readonly s3: S3Client,
		private readonly configService: ConfigService
	) {}

	async upload(params: UploadParams): Promise<string> {
		const bucket = this.configService.get<string>('S3_BUCKET');
		await this.s3.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: params.key,
				Body: params.body,
				ContentType: params.contentType,
			})
		);
		// DB에 영구 저장되는 URL이므로 만료되는 presigned URL은 쓸 수 없다.
		// 운영 버킷은 완전 비공개(퍼블릭 액세스 차단)라 S3 정적 URL은 403이므로 CloudFront 도메인을 앞에 붙인다 —
		// 터라폼이 ASSET_BASE_URL로 주입한다(infra/terraform/envs/prod/storage.tf).
		// 미설정 시의 S3 정적 URL은 CDN 없이 공개 버킷을 쓰는 로컬 개발용 폴백이다.
		const assetBaseUrl = this.configService.get<string>('ASSET_BASE_URL');
		if (assetBaseUrl) return `${assetBaseUrl}/${params.key}`;

		return `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${params.key}`;
	}
}
