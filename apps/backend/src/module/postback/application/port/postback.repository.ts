import { PostbackDto } from '@postback/application/dto/postback.dto';

export const POSTBACK_REPOSITORY = Symbol('POSTBACK_REPOSITORY');

export interface PostbackRepository {
	createMany(postbacks: PostbackDto[]): Promise<void>;
}
