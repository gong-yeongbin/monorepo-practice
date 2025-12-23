import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { ICampaignConfig } from '@campaign/domain/repositories';

@Injectable()
export class CampaignConfigRepository implements ICampaignConfig {
	constructor(private readonly prismaService: PrismaService) {}
}
