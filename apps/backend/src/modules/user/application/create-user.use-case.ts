// 비밀번호를 bcrypt로 해싱해 user를 생성하는 use-case
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '@user/application/dto/create-user.dto';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class CreateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(dto: CreateUserDto): Promise<void> {
		const existing = await this.userRepository.findByUserId(dto.user_id);
		if (existing) {
			throw new ConflictException('already exists user_id');
		}

		const password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
		await this.userRepository.create({ user_id: dto.user_id, password, role: dto.role });
	}
}
