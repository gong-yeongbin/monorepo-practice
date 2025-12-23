import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TRACKER_REPOSITORY } from '@tracker/domain/symbol';
import { ITracker } from '@tracker/domain/repositories';
import { UpdateTrackerInput } from '@tracker/dto/request';
import { UpdateTrackerDto } from '@tracker/dto';
import { Tracker } from '@tracker/dto/response';

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
