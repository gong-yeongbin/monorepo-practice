// HttpPort 바인딩을 캡슐화하는 HTTP 인프라 모듈
import { Module } from '@nestjs/common';
import { HTTP_PORT } from '@infra/http/http.port';
import { FetchHttpAdapter } from '@infra/http/fetch-http.adapter';

@Module({
	providers: [{ provide: HTTP_PORT, useClass: FetchHttpAdapter }],
	exports: [HTTP_PORT],
})
export class HttpModule {}
