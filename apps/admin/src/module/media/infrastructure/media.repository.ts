import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { IMedia, Media } from '@module/media/domain';
import { MediaDto } from '@module/media/dto/media.dto';

@Injectable()
export class MediaRepository implements IMedia {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Media | null> {
		try {
			return await this.prismaService.media.findUnique({ where: { id: id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findByName(name: string): Promise<Media | null> {
		try {
			return await this.prismaService.media.findUnique({ where: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findMany(): Promise<Media[] | null> {
		try {
			return await this.prismaService.media.findMany();
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(media: MediaDto): Promise<Media> {
		try {
			return await this.prismaService.media.create({ data: media });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(id: number, media: MediaDto): Promise<Media> {
		try {
			return await this.prismaService.media.update({ where: { id: id }, data: media });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
