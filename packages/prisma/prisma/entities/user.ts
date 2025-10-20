import { $Enums, user } from '@prisma/client';

export class User implements user {
	id: number;
	user_id: string;
	password: string;
	salt: string;
	role: $Enums.Role;
}
