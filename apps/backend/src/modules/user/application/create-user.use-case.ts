// email로 user를 생성하는 use-case(중복 email이면 409)
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class CreateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(email: string): Promise<void> {
		const existing = await this.userRepository.findByEmail(email);
		if (existing) {
			throw new ConflictException('already exists email');
		}

		await this.userRepository.create({ email });
	}
}
