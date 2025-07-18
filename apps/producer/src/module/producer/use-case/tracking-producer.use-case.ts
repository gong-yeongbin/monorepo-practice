import { Injectable } from '@nestjs/common';
import { TrackingDto } from '../dto/request';

@Injectable()
export class TrackingProducerUseCase {
	constructor() {}

	async producer(query: TrackingDto): Promise<string> {
		console.log(query);
		// 캐시 조회 (token)
		//-- 데이터베이스 캠페인 조회 (token)
		// 리다이렉트 url
		// 데일리 클릭 카운트 (token + pub + sub = view_code)
		// 트래킹 로그
		return '';
	}
}
