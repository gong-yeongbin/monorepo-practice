import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ITracker, TRACKER_REPOSITORY } from '@module/tracker/domain';
import { UpdateTrackerDto } from '@module/tracker/dto/request';
import { ResponseUpdateTrackerDto } from '@module/tracker/dto/response';
import { TrackerDto } from '@module/tracker/dto/tracker.dto';

@Injectable()
export class UpdateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute(id: number, request: UpdateTrackerDto) {
		const { name, trackingUrl, installPostbackUrl, eventPostbackUrl } = request;

		const tracker = await this.trackerRepository.findById(id);
		if (!tracker) throw new NotFoundException();

		const trackerDto = plainToInstance(TrackerDto, { name, trackingUrl, installPostbackUrl, eventPostbackUrl });
		const response = await this.trackerRepository.update(id, trackerDto);

		const responseUpdateTrackerDto = plainToInstance(ResponseUpdateTrackerDto, response);

		return {
			data: responseUpdateTrackerDto,
		};
	}
}
