import { EachBatchPayload } from 'kafkajs';

export interface IConsumer {
	registerBatch(topic: string, handler: (p: EachBatchPayload) => Promise<void>): Promise<void>;
}
