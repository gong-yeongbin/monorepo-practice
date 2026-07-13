// media 조회·생성·수정·삭제 repository 인터페이스와 DI 토큰
import { Media, MediaWithCampaignCount } from '@media/domain/media.entity';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface CreateMediaProps {
	name: string;
	install_postback_url: string;
	event_postback_url: string;
}

export type UpdateMediaProps = CreateMediaProps;

export interface MediaRepository {
	findAllWithCampaignCount(): Promise<MediaWithCampaignCount[]>;
	findById(id: number): Promise<Media | null>;
	findByName(name: string): Promise<Media | null>;
	create(props: CreateMediaProps): Promise<Media>;
	update(id: number, props: UpdateMediaProps): Promise<Media>;
	delete(id: number): Promise<void>;
	countCampaign(media_id: number): Promise<number>;
}
