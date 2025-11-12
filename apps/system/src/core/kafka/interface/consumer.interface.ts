import { EachBatchPayload, EachMessagePayload } from 'kafkajs';

export interface IConsumer {
	init(groupId: string): Promise<void>;
	each(topic: string, eachMessage: (params: EachMessagePayload) => Promise<void>): Promise<void>;
	batch(topic: string, eachBatch: (params: EachBatchPayload) => Promise<void>): Promise<void>;
}
