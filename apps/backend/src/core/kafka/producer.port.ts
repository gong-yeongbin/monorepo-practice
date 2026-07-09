export const PRODUCER_PORT = Symbol('PRODUCER_PORT');

export interface ProducerPort {
	send(topic: string, message: string): Promise<void>;
}
