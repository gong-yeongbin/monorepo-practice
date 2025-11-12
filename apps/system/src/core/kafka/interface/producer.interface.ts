export interface IProducer {
	each(topic: string, message: string): Promise<void>;
	batch(topic: string, messages: string[]): Promise<void>;
}
