import { Media } from './media.entity';
import { MediaDto } from '@module/media/dto/media.dto';

export interface IMedia {
	findById(id: number): Promise<Media | null>;
	findByName(name: string): Promise<Media | null>;
	findMany(): Promise<Media[] | null>;
	create(media: MediaDto): Promise<Media>;
	update(id: number, media: MediaDto): Promise<Media>;
}
