// password·role을 부분 수정하는 use-case(password는 bcrypt로 재해싱)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Profile, toProfile } from '@user/domain/user.entity';
import { USER_REPOSITORY, UpdateUserProps, UserRepository } from '@user/domain/user.repository';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UpdateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number, dto: UpdateUserDto): Promise<Profile> {
		if (!(await this.userRepository.findById(id))) {
			throw new NotFoundException();
		}

		const props: UpdateUserProps = {};
		if (dto.password !== undefined) {
			props.password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
		}
		if (dto.role !== undefined) {
			props.role = dto.role;
		}

		const updated = await this.userRepository.update(id, props);
		return toProfile(updated);
	}
}
