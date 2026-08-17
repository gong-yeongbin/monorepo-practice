// 외부 HTTP 호출 포트 인터페이스와 DI 토큰
export const HTTP_PORT = Symbol('HTTP_PORT');

export interface HttpGetResult {
	ok: boolean; // 2xx 여부
	status: number;
}

export interface HttpPort {
	// 네트워크 오류·타임아웃 시 reject된다. 실패 격리는 호출부 책임
	get(url: string, options?: { timeoutMs?: number }): Promise<HttpGetResult>;
}
