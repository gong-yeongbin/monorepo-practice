import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrackerDto } from '../shared/dto';
import { UpdateTrackerDto } from '../dto/request';
import { ResponseUpdateTrackerDto } from '../dto/response';
import { TrackerRepository } from '../domain';

@Injectable()
export class UpdateTrackerUseCase {
	constructor(private readonly trackerRepository: TrackerRepository) {}

	async execute(id: number, request: UpdateTrackerDto) {
		const { name, trackingUrl, installPostbackUrl, eventPostbackUrl } = request;

		const tracker = await this.trackerRepository.findById(id);
		if (!tracker) throw new NotFoundException();

		const trackerDto = plainToInstance(TrackerDto, { name: name, tracking_url: trackingUrl, install_postback_url: installPostbackUrl, event_postback_url: eventPostbackUrl });
		const data = await this.trackerRepository.update(id, trackerDto);
		const response = plainToInstance(ResponseUpdateTrackerDto, {
			id: data.id,
			name: data.name,
			trackingUrl: data.tracking_url,
			installPostbackUrl: data.install_postback_url,
			eventPostbackUrl: data.event_postback_url,
		});

		return {
			data: response,
		};
	}
}
