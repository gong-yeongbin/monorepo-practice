import { user } from '@repo/prisma';

export class User implements user {
	id: number;
	user_id: string;
	password: string;
	salt: string;
	role: string;
}
