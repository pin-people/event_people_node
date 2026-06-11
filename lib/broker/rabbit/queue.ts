import { Channel, ConsumeMessage, Message } from 'amqplib';
import { Event } from '../../event';
import { DeliveryInfo } from '../../listeners/base-listener';
import { Topic } from './topic';
import { Config } from '../../config';
import { Context } from '@lib/context';
import { RabbitContext } from './rabbit-context';

export class Queue {
	private config = Config;
	constructor(
		private readonly channel: Channel,
		private readonly topic: Topic,
	) {}

	/**
	 * Makes a subscription to receive events for a certain routingKey.
	 * Declares DLX, DLQ and retry queue topology before binding.
	 * @param {string} routingKey - name path for the queue. Example: messages.*.all
	 * @param {Function}  method - function to execute actions after event received
	 * @param {number} maxAttempts - max delivery attempts before sending to DLQ
	 * @param {string} delayStrategy - 'exponential' or 'fixed'
	 * @param {string} dlqName - dead-letter queue name
	 * @returns {Promise<void>}
	 */
	async subscribe(
		routingKey: string,
		method: (event: Event, context: Context) => void,
		maxAttempts?: number,
		delayStrategy?: string,
		dlqName?: string,
	): Promise<void> {
		const retryConfig = Config.getRetryConfig();
		const resolvedMaxAttempts = maxAttempts ?? retryConfig.maxAttempts;
		const resolvedDelayStrategy = delayStrategy ?? retryConfig.delayStrategy;
		const resolvedDlqName = dlqName ?? retryConfig.dlqName;

		const queueName = this.queueName(routingKey);
		const dlxName = `${Config.APP_NAME}_dlx`;
		const retryQueueName = `${queueName}_retry`;

		// Declare DLX (fanout exchange)
		await this.channel.assertExchange(dlxName, 'fanout', { durable: true });

		// Declare DLQ and bind to DLX
		await this.channel.assertQueue(resolvedDlqName, { durable: true });
		await this.channel.bindQueue(resolvedDlqName, dlxName, '');

		// Declare retry queue — TTL is set per-message via expiration, not x-message-ttl
		await this.channel.assertQueue(retryQueueName, {
			durable: true,
			arguments: {
				'x-dead-letter-exchange': '',
				'x-dead-letter-routing-key': queueName,
			},
		});

		// Declare main queue with DLX routing
		const assertedQueue = await this.channel.assertQueue(queueName, {
			exclusive: false,
			durable: true,
			arguments: {
				'x-dead-letter-exchange': dlxName,
			},
		});

		await this.channel.prefetch(1);

		await this.channel.bindQueue(
			assertedQueue.queue,
			this.topic.getTopic(),
			routingKey,
		);

		await this.channel.consume(queueName, (message: ConsumeMessage | null) => {
			if (!message) return;

			const retryCount = Math.max(
				0,
				Number(message.properties.headers?.['x-event-people-retries'] ?? 0),
			);

			const eventPayload: Record<string, any> = JSON.parse(
				message.content.toString(),
			);

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: String(message.fields.deliveryTag),
				routingKey: message.fields.routingKey,
			};

			this.callback(
				deliveryInfo,
				eventPayload,
				message as Message,
				method,
				queueName,
				resolvedMaxAttempts,
				resolvedDelayStrategy,
				retryCount,
				resolvedDlqName,
			);
		});
	}

	/**
	 * Callback to create new rabbit context to handle received message
	 * @param {DeliveryInfo} deliveryInfo - info about received queue message
	 * @param {Record<string, any>} payload - the message body
	 * @param {Message} message - raw AMQP message
	 * @param {Function} method - next callback to execute
	 * @param {string} queueName - name of the consuming queue
	 * @param {number} maxAttempts - max delivery attempts
	 * @param {string} delayStrategy - retry delay strategy
	 * @param {number} retryCount - current retry count from headers
	 * @param {string} dlqName - dead-letter queue name
	 * @returns {void}
	 */
	private callback(
		deliveryInfo: DeliveryInfo,
		payload: Record<string, any>,
		message: Message,
		method: (event: Event, context: Context) => void,
		queueName: string,
		maxAttempts: number,
		delayStrategy: string,
		retryCount: number,
		dlqName: string,
	): void {
		const event = new Event(
			deliveryInfo.routingKey,
			payload,
			1.0,
			retryCount,
		);
		const context = new RabbitContext(
			this.channel,
			message,
			queueName,
			maxAttempts,
			delayStrategy,
			retryCount,
			dlqName,
		);
		method(event, context);
	}

	/**
	 * Returns the full queue name
	 * @param {string}  routingKey  - queue path string
	 * @returns {string} string
	 */
	private queueName(routingKey: string): string {
		const fixed = Event.fixedEventName(routingKey, 'all');
		const name = `${Config.APP_NAME}-${fixed}`.toLowerCase();
		return name;
	}
}
