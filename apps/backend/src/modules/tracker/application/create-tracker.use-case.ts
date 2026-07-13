// 이름 중복을 검사하고 tracker를 생성하는 use-case
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Tracker } from '@tracker/domain/tracker.entity';
import { TRACKER_REPOSITORY, TrackerRepository } from '@tracker/domain/tracker.repository';
import { CreateTrackerDto } from '@tracker/application/dto/create-tracker.dto';

@Injectable()
export class CreateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: TrackerRepository) {}

	async execute(dto: CreateTrackerDto): Promise<Tracker> {
		if (await this.trackerRepository.findByName(dto.name)) {
			throw new ConflictException('already exists tracker name');
		}

		return this.trackerRepository.create({
			name: dto.name,
			tracking_url: dto.tracking_url,
			install_postback_url: dto.install_postback_url,
			event_postback_url: dto.event_postback_url,
		});
	}
}
