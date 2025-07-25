import { AdController } from './controller/ad.controller';
import { Module } from '@nestjs/common';

@Module({
	controllers: [AdController],
})
export class AdModule {}
