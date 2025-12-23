import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TRACKER_REPOSITORY } from '@tracker/domain/symbol';
import { ITracker } from '@tracker/domain/repositories';
import { CreateTrackerInput } from '@tracker/dto/request';
import { CreateTrackerDto } from '@tracker/dto';
import { Tracker } from '@tracker/dto/response';

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
