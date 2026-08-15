// install 포스트백 로그를 조회하는 use-case(어드민 인스톨 모달)
import { Inject, Injectable } from '@nestjs/common';
import { PostbackLog } from '@postback/domain/postback.entity';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/domain/postback.repository';
import { InstallLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';

@Injectable()
export class ListInstallPostbacksUseCase {
	constructor(@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository) {}

	async execute(dto: InstallLogDto): Promise<PostbackLog[]> {
		return this.postbackRepository.findInstalls({ token: dto.token, view_code: dto.view_code, ...kstDayRange(dto.start_date, dto.end_date) });
	}
}
