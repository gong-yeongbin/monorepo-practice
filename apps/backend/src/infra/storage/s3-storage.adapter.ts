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
		// DB에 영구 저장되는 URL이므로 presigned가 아닌 public-read 버킷의 정적 URL을 쓴다
		return `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${params.key}`;
	}
}
