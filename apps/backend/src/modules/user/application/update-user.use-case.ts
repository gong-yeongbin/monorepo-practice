// role·approved(승인 여부)를 부분 수정하는 use-case
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

		return this.userRepository.update(id, props);
	}
}
