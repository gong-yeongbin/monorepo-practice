import { Injectable } from '@nestjs/common';
import { AdRepository } from '../domain';

@Injectable()
export class PrismaAdRepository implements AdRepository {
	constructor() {}
}
