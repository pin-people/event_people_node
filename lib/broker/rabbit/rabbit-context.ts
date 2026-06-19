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
		initialDelay: number,
		delayStrategy: string,
		retryCount: number,
		dlqName: string,
	) {
		this.maxRetries = maxRetries;
		this.dlqName = dlqName;
		this.retryCount = retryCount;
		this.retryManager = new RetryManager(
			maxRetries,
			delayStrategy,
			initialDelay,
		);
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
	 * Otherwise publish the message to the application-level DLQ and ack.
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
				try {
					this.channel.ack(this.message, false);
				} catch (_ackErr) {
					// Publish succeeded; swallow ack errors. The message may be redelivered
					// once (at-least-once), but that is safer than nacking to DLQ when a
					// retry copy is already enqueued.
				}
			} catch (_err) {
				try {
					this.channel.nack(this.message, false, false);
				} catch (_nackErr) {
					// Channel already dead; message will be redelivered on reconnect.
				}
			}
		} else {
			// Retries exhausted: publish the message to the application-level DLQ + ack.
			this.deadLetter();
		}
	}

	/**
	 * Reject the message — route it directly to the application-level DLQ (no retries).
	 */
	public reject(): void {
		this.deadLetter();
	}

	/**
	 * Publish the current message to the application-level DLQ via the default
	 * exchange (routing key = DLQ name) and ack. On a missing channel/DLQ name or
	 * any publish failure, fall back to nack(requeue=false) so a failed message is
	 * never requeued to the main queue without a retry increment.
	 */
	private deadLetter(): void {
		if (!this.channel || !this.dlqName) {
			this.nackWithoutRequeue();
			return;
		}

		try {
			const published = this.channel.publish(
				'',
				this.dlqName,
				Buffer.from(this.message.content),
				{
					persistent: true,
					headers: { 'x-event-people-retries': this.retryCount },
					contentType: this.message.properties.contentType,
				},
			);
			if (!published) {
				this.nackWithoutRequeue();
				return;
			}
			this.channel.ack(this.message, false);
		} catch (_err) {
			this.nackWithoutRequeue();
		}
	}

	private nackWithoutRequeue(): void {
		try {
			this.channel.nack(this.message, false, false);
		} catch (_nackErr) {
			// Channel already dead; message will be redelivered on reconnect.
		}
	}
}
