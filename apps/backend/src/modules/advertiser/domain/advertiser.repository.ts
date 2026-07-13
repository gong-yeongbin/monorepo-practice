// advertiser 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { Advertiser } from '@advertiser/domain/advertiser.entity';

export const ADVERTISER_REPOSITORY = Symbol('ADVERTISER_REPOSITORY');

export interface AdvertiserRepository {
	findAll(): Promise<Advertiser[]>;
	findById(id: number): Promise<Advertiser | null>;
	findByName(name: string): Promise<Advertiser | null>;
	create(name: string): Promise<Advertiser>;
	update(id: number, name: string): Promise<Advertiser>;
	delete(id: number): Promise<void>;
	countAdvertising(advertiser_id: number): Promise<number>;
}
