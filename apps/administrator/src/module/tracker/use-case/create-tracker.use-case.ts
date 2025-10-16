import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrackerDto } from '../shared/dto';
import { CreateTrackerDto } from '../dto/request';
import { ResponseCreateTrackerDto } from '../dto/response';
import { TrackerRepository } from '../domain';

@Injectable()
export class CreateTrackerUseCase {
	constructor(private readonly trackerRepository: TrackerRepository) {}

	async execute(request: CreateTrackerDto) {
		const { name, trackingUrl, installPostbackUrl, eventPostbackUrl } = request;

		const tracker = await this.trackerRepository.findByName(name);
		if (tracker) throw new ConflictException();

		const trackerDto = plainToInstance(TrackerDto, { name, tracking_url: trackingUrl, install_postback_url: installPostbackUrl, event_postback_url: eventPostbackUrl });
		const response = await this.trackerRepository.create(trackerDto);
		const responseCreateTrackerDto = plainToInstance(ResponseCreateTrackerDto, {
			id: response.id,
			name: response.name,
			trackingUrl: response.tracking_url,
			installPostbackUrl: response.install_postback_url,
			eventPostbackUrl: response.event_postback_url,
		});

		return {
			data: responseCreateTrackerDto,
		};
	}
}
