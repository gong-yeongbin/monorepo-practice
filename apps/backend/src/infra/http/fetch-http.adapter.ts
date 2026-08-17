// global fetch 기반 HttpPort 어댑터
import { Injectable } from '@nestjs/common';
import { HttpGetResult, HttpPort } from '@infra/http/http.port';

const DEFAULT_TIMEOUT_MS = 5000;

@Injectable()
export class FetchHttpAdapter implements HttpPort {
	async get(url: string, options?: { timeoutMs?: number }): Promise<HttpGetResult> {
		const response = await fetch(url, { signal: AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS) });
		// 응답 본문은 쓰지 않으므로 커넥션 반환을 위해 버린다
		await response.body?.cancel();
		return { ok: response.ok, status: response.status };
	}
}
