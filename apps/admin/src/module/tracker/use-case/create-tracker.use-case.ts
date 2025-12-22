import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateTrackerInput } from '@module/tracker/dto/request';
import { Tracker } from '@module/tracker/dto/response';
import { CreateTrackerDto } from '@module/tracker/dto';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';
import { ITracker } from '@module/tracker/domain/repositories';

@Injectable()
export class CreateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute(input: CreateTrackerInput) {
		const { name, trackingUrl, installPostbackUrl, eventPostbackUrl } = input;

		const tracker = await this.trackerRepository.findByName(name);
		if (tracker) throw new ConflictException();

		const trackerDto = plainToInstance(CreateTrackerDto, { name, trackingUrl, installPostbackUrl, eventPostbackUrl });
		const result = await this.trackerRepository.create(trackerDto);

		return plainToInstance(Tracker, result, { excludeExtraneousValues: true });
	}
}
