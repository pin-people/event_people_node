import { Channel, ConsumeMessage, Message } from 'amqplib';
import { Event } from '../../event';
import { BaseListener, DeliveryInfo } from '../../listeners/base-listener';
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
	 * Resolves the effective retry configuration by merging listener class static
	 * attributes over the global Config defaults.
	 * Precedence: listener static prop > Config.configure value > hardcoded default.
	 */
	private resolveRetryConfig(listenerClass?: typeof BaseListener): {
		maxAttempts: number;
		initialDelay: number;
		delayStrategy: string;
		dlqName: string;
	} {
		const base = Config.getRetryConfig();
		if (!listenerClass) return base;
		return {
			maxAttempts: listenerClass.maxAttempts ?? base.maxAttempts,
			initialDelay: listenerClass.initialDelay ?? base.initialDelay,
			delayStrategy: listenerClass.delayStrategy ?? base.delayStrategy,
			dlqName: listenerClass.dlqName ?? base.dlqName,
		};
	}

	/**
	 * Makes a subscription to receive events for a certain routingKey.
	 * Declares DLX, DLQ and retry queue topology before binding.
	 * Retry configuration is resolved from listener class attributes (if provided),
	 * falling back to Config defaults.
	 * @param {string} routingKey - name path for the queue. Example: messages.*.all
	 * @param {Function}  method - function to execute actions after event received
	 * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
	 * @returns {Promise<void>}
	 */
	async subscribe(
		routingKey: string,
		method: (event: Event, context: Context) => void,
		listenerClass?: typeof BaseListener,
	): Promise<void> {
		const retryConfig = this.resolveRetryConfig(listenerClass);

		const queueName = this.queueName(routingKey);
		const dlxName = `${Config.APP_NAME}_dlx`;
		const retryQueueName = `${queueName}_retry`;
		const dlqName = retryConfig.dlqName;

		// Declare DLX (fanout exchange)
		await this.channel.assertExchange(dlxName, 'fanout', { durable: true });

		// Declare DLQ and bind to DLX
		await this.channel.assertQueue(dlqName, { durable: true });
		await this.channel.bindQueue(dlqName, dlxName, '');

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
				listenerClass,
			);
		});
	}

	/**
	 * Callback to create new rabbit context to handle received message.
	 * Builds Event + Context from broker delivery and calls user callback.
	 * Retry config is resolved from listener class attributes (if provided),
	 * falling back to Config defaults.
	 * @param {DeliveryInfo} deliveryInfo - info about received queue message
	 * @param {Record<string, any>} payload - the message body
	 * @param {Message} message - raw AMQP message
	 * @param {Function} method - next callback to execute
	 * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
	 * @returns {void}
	 */
	private callback(
		deliveryInfo: DeliveryInfo,
		payload: Record<string, any>,
		message: Message,
		method: (event: Event, context: Context) => void,
		listenerClass?: typeof BaseListener,
	): void {
		const retryConfig = this.resolveRetryConfig(listenerClass);
		const queueName = this.queueName(deliveryInfo.routingKey);

		const retryCount = Math.max(
			0,
			Number(message.properties?.headers?.['x-event-people-retries'] ?? 0),
		);

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
			retryConfig.maxAttempts,
			retryConfig.initialDelay,
			retryConfig.delayStrategy,
			retryCount,
			retryConfig.dlqName,
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
