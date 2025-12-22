import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';
import { ITracker } from '@module/tracker/domain/repositories';
import { Tracker } from '@module/tracker/dto/response';
import { UpdateTrackerDto } from '@module/tracker/dto';
import { UpdateTrackerInput } from '@module/tracker/dto/request';

@Injectable()
export class UpdateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute(request: UpdateTrackerInput) {
		const { id, name, trackingUrl, installPostbackUrl, eventPostbackUrl } = request;

		const tracker = await this.trackerRepository.findById(id);
		if (!tracker) throw new NotFoundException();

		const updateTracker = plainToInstance(UpdateTrackerDto, { id, name, trackingUrl, installPostbackUrl, eventPostbackUrl });
		const result = await this.trackerRepository.update(updateTracker);

		return plainToInstance(Tracker, result, { excludeExtraneousValues: true });
	}
}
