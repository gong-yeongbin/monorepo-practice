// advertiser 조회·생성 repository 인터페이스와 DI 토큰
import { Advertiser } from '@advertiser/domain/advertiser.entity';

export const ADVERTISER_REPOSITORY = Symbol('ADVERTISER_REPOSITORY');

export interface AdvertiserRepository {
	findAll(): Promise<Advertiser[]>;
	findByName(name: string): Promise<Advertiser | null>;
	create(name: string): Promise<Advertiser>;
}
