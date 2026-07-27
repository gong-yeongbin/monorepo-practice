// 파일 업로드 스토리지 포트 인터페이스와 DI 토큰
export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadParams {
	key: string;
	body: Buffer;
	contentType: string;
}

export interface StoragePort {
	// 업로드 후 브라우저에서 바로 로드 가능한 공개 URL을 반환한다
	upload(params: UploadParams): Promise<string>;
}
