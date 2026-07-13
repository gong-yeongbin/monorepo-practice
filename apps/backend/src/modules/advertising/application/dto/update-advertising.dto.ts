import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';

// 전체 교체 방식이라 create와 동일한 필드를 모두 요구한다
export class UpdateAdvertisingDto extends CreateAdvertisingDto {}
