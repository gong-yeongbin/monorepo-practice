import { CreateTrackerDto } from '@tracker/application/dto/create-tracker.dto';

// 전체 교체 방식이라 create와 동일한 4개 필드를 모두 요구한다
export class UpdateTrackerDto extends CreateTrackerDto {}
