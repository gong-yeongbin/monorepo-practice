import { registerEnumType } from '@nestjs/graphql';

export enum Type {
	CPI = 'CPI',
	CPA = 'CPA',
}

registerEnumType(Type, {
	name: 'Type',
	description: 'Campaign Type',
});
