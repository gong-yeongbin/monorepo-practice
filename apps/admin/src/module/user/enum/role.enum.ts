import { registerEnumType } from '@nestjs/graphql';

export enum Role {
	ADMIN = 'ADMIN',
	MEDIA = 'MEDIA',
	ADVERTISER = 'ADVERTISER',
}

registerEnumType(Role, {
	name: 'Role',
	description: 'User role',
});
