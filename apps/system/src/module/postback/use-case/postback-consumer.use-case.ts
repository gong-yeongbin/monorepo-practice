import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PostbackDto } from '@postback/dto';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { IPostback } from '@postback/domain/repositories';

@Injectable()
export class PostbackConsumerUseCase {
	constructor(@Inject(POSTBACK_REPOSITORY) private readonly postbackRepositroy: IPostback) {}

	async execute(message: string) {
		const postback = plainToInstance(PostbackDto, message, { ignoreDecorators: true, enableImplicitConversion: true });
		await this.postbackRepositroy.create(postback);
	}
}
