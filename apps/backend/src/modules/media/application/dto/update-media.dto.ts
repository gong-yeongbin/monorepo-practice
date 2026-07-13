import { CreateMediaDto } from '@media/application/dto/create-media.dto';

// 전체 교체 방식이라 create와 동일한 3개 필드를 모두 요구한다
export class UpdateMediaDto extends CreateMediaDto {}
