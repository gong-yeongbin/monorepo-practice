import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateTrackerDto } from '@module/tracker/dto/request';
import { ResponseCreateTrackerDto } from '@module/tracker/dto/response';
import { ITracker, TRACKER_REPOSITORY } from '@module/tracker/domain';
import { TrackerDto } from '@module/tracker/dto/tracker.dto';

@Injectable()
export class CreateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute(request: CreateTrackerDto) {
		const { name, trackingUrl, installPostbackUrl, eventPostbackUrl } = request;

		const tracker = await this.trackerRepository.findByName(name);
		if (tracker) throw new ConflictException();

		const trackerDto = plainToInstance(TrackerDto, { name, trackingUrl, installPostbackUrl, eventPostbackUrl });
		const response = await this.trackerRepository.create(trackerDto);

		const responseCreateTrackerDto = plainToInstance(ResponseCreateTrackerDto, response);

		return {
			data: responseCreateTrackerDto,
		};
	}
}
