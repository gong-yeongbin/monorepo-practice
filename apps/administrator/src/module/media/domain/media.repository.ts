import { Media } from '@repo/prisma';
import { MediaDto } from '@module/media/shared/dto';

export abstract class MediaRepository {
	abstract findById(id: number): Promise<Media | null>;
	abstract findByName(name: string): Promise<Media | null>;
	abstract create(media: MediaDto): Promise<Media>;
	abstract update(id: number, media: MediaDto): Promise<Media>;
}
