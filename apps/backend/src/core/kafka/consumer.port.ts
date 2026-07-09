export const CONSUMER_PORT = Symbol('CONSUMER_PORT');

export type BatchHandler = (messages: string[]) => Promise<void>;

export interface ConsumerPort {
	register(topic: string, handler: BatchHandler): void;
}
