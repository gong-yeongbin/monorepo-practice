import { Media } from './media.entity';
import { CreateMediaDto, UpdateMediaDto } from '@module/media/dto';

export interface IMedia {
	findById(id: number): Promise<Media | null>;
	findByName(name: string): Promise<Media | null>;
	findMany(): Promise<Media[]>;
	create(media: CreateMediaDto): Promise<Media>;
	update(media: UpdateMediaDto): Promise<Media>;
}
