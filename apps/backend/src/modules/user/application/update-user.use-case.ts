// role·approved(승인 여부)·advertising_ids(허용 광고 목록)를 부분 수정하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { USER_REPOSITORY, UpdateUserProps, UserRepository } from '@user/domain/user.repository';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number, dto: UpdateUserDto): Promise<User> {
		if (!(await this.userRepository.findById(id))) {
			throw new NotFoundException();
		}

		const props: UpdateUserProps = {};
		if (dto.role !== undefined) {
			props.role = dto.role;
		}
		if (dto.approved !== undefined) {
			props.approved = dto.approved;
		}
		if (dto.advertising_ids !== undefined) {
			// 중복 id는 user_advertising 복합 PK 충돌을 내므로 미리 제거한다
			const advertising_ids = [...new Set(dto.advertising_ids)];
			// 존재하지 않는 광고를 허용 목록에 넣으면 FK 위반으로 500이 되므로 사전에 404로 거른다.
			// 빈 배열은 0 === 0으로 통과한다(아무것도 못 보게 하는 유효한 값)
			if ((await this.userRepository.countAdvertising(advertising_ids)) !== advertising_ids.length) {
				throw new NotFoundException('not found advertising');
			}
			props.advertising_ids = advertising_ids;
		}

		return this.userRepository.update(id, props);
	}
}
