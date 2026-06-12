import { Channel } from 'amqplib';
import { Context } from '../../context';
import { Message } from 'amqplib/properties';
import { RetryManager } from './retry-manager';

export class RabbitContext implements Context {
	public maxRetries: number;
	public dlqName: string;
	private readonly retryCount: number;
	private readonly retryManager: RetryManager;

	constructor(
		private readonly channel: Channel,
		private readonly message: Message,
		private readonly queueName: string,
		maxRetries: number,
		delayStrategy: string,
		retryCount: number,
		dlqName: string,
	) {
		this.maxRetries = maxRetries;
		this.dlqName = dlqName;
		this.retryCount = retryCount;
		this.retryManager = new RetryManager(maxRetries, delayStrategy);
	}

	/**
	 * True when the current attempt is the last before DLQ
	 */
	get isLastRetry(): boolean {
		return this.retryCount >= this.maxRetries - 1;
	}

	public success(): void {
		this.channel.ack(this.message, false);
	}

	/**
	 * If retry attempts remain, republish to the retry queue with exponential/fixed delay.
	 * Otherwise nack without requeue (triggers DLX → DLQ).
	 */
	public fail(): void {
		if (this.retryManager.shouldRetry(this.retryCount)) {
			const retryQueueName = `${this.queueName}_retry`;
			const delay = this.retryManager.getNextDelay(this.retryCount);
			const originalBody = this.message.content;

			try {
				this.channel.publish('', retryQueueName, Buffer.from(originalBody), {
					headers: { 'x-event-people-retries': this.retryCount + 1 },
					expiration: String(delay),
					contentType: this.message.properties.contentType,
				});
				this.channel.ack(this.message, false);
			} catch (_err) {
				this.channel.nack(this.message, false, false);
			}
		} else {
			this.channel.nack(this.message, false, false);
		}
	}

	/**
	 * Reject the message — nack without requeue, triggers DLX → DLQ.
	 */
	public reject(): void {
		this.channel.nack(this.message, false, false);
	}
}
