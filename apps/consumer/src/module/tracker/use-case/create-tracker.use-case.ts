import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrackerDto } from '../shared/dto';
import { CreateTrackerDto } from '../dto/request';
import { ResponseCreateTrackerDto } from '../dto/response';
import { TrackerRepository } from '../domain';

@Injectable()
export class CreateTrackerUseCase {
	constructor(private readonly trackerRepository: TrackerRepository) {}

	async execute(createTrackerDto: CreateTrackerDto) {
		const { name, tracking_url, install_postback_url, event_postback_url } = createTrackerDto;

		const tracker = await this.trackerRepository.findByName(name);
		if (tracker) throw new ConflictException();

		const trackerDto = plainToInstance(TrackerDto, { name, tracking_url, install_postback_url, event_postback_url });
		const data = await this.trackerRepository.create(trackerDto);
		const response = plainToInstance(ResponseCreateTrackerDto, {
			id: data.id,
			name: data.name,
			tracking_url: data.tracking_url,
			install_postback_url: data.install_postback_url,
			event_postback_url: data.event_postback_url,
		});

		return {
			data: response,
		};
	}
}
