// DEVELOPER가 지정한 user의 비밀번호를 새 값으로 초기화하는 use-case (현재 비밀번호 검증 없음)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { UpdateUserPasswordDto } from '@user/application/dto/update-user-password.dto';

// signup.use-case와 같은 cost. bcrypt 해시는 cost를 자체 포함하므로 값이 달라져도 기존 해시 검증은 그대로 동작한다.
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UpdateUserPasswordUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number, dto: UpdateUserPasswordDto): Promise<void> {
		if (!(await this.userRepository.findById(id))) {
			throw new NotFoundException();
		}

		await this.userRepository.updatePassword(id, await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS));
	}
}
