import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MediaRepository } from '../domain';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Media } from '@repo/prisma/entity';
import { MediaDto } from '../shared/dto';

@Injectable()
export class PrismaMediaRepository implements MediaRepository {
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
