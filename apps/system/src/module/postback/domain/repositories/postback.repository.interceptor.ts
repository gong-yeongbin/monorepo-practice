import { Postback } from '../entities';
import { PostbackDto } from '@postback/dto';

export interface IPostback {
	create(postback: PostbackDto): Promise<Postback>;
}
