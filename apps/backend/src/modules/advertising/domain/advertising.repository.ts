// advertising 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { Advertising, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';

export const ADVERTISING_REPOSITORY = Symbol('ADVERTISING_REPOSITORY');

export interface CreateAdvertisingProps {
	name: string;
	image: string | null;
	advertiser_id: number;
	tracker_id: number;
}

export type UpdateAdvertisingProps = CreateAdvertisingProps;

export interface ListAdvertisingParams {
	search: string;
	offset: number;
	limit: number;
}

export interface AdvertisingRepository {
	exists(id: number): Promise<boolean>;
	trackerExists(tracker_id: number): Promise<boolean>;
	advertiserExists(advertiser_id: number): Promise<boolean>;
	findByName(name: string): Promise<Advertising | null>;
	create(props: CreateAdvertisingProps): Promise<Advertising>;
	update(id: number, props: UpdateAdvertisingProps): Promise<Advertising>;
	delete(id: number): Promise<void>;
	list(params: ListAdvertisingParams): Promise<AdvertisingListItem[]>;
	get(id: number): Promise<AdvertisingInfo | null>;
	countCampaign(advertising_id: number): Promise<number>;
}
