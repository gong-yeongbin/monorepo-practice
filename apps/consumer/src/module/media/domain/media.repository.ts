import { Media } from '@repo/prisma/entity';
import { MediaDto } from '../shared/dto';

export abstract class MediaRepository {
	abstract findByName(name: string): Promise<Media | null>;
	abstract create(media: MediaDto): Promise<Media>;
}
