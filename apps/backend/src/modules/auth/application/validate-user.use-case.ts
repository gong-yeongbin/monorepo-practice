// user_id/password 자격을 bcrypt로 검증하는 use-case
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FindUserUseCase } from '@user/application/find-user.use-case';
import { Profile } from '@user/application/get-profile.use-case';

@Injectable()
export class ValidateUserUseCase {
	constructor(private readonly findUserUseCase: FindUserUseCase) {}

	async execute(user_id: string, password: string): Promise<Profile | null> {
		const user = await this.findUserUseCase.execute(user_id);
		if (!user) {
			return null;
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return null;
		}

		return { id: user.id, user_id: user.user_id, role: user.role };
	}
}
