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
	 * Makes a subscription to receive events for a certain routingKey
	 * @param {string} routingKey - name path for the queue. Example: messages.*.all
	 * @param {Function}  method - function to execute actions after event received
	 * @returns {Promise<Message>} Promise of Message
	 *
	 */
	async subscribe(
		routingKey: string,
		method: (event: Event, context: Context) => void,
	): Promise<void> {
		const queueName = this.queueName(routingKey);

		const assertedQueue = await this.channel.assertQueue(queueName, {
			exclusive: false,
			durable: true,
		});

		await this.channel.prefetch(1);

		await this.channel.bindQueue(
			assertedQueue.queue,
			this.topic.getTopic(),
			routingKey,
		);

		await this.channel.consume(queueName, (message: ConsumeMessage) => {
			const eventPayload: Record<string, any> = JSON.parse(
				String(message.content),
			);

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: String(message.fields.deliveryTag),
				routingKey: message.fields.routingKey,
			};

			this.callback(deliveryInfo, eventPayload, message as Message, method);
		});
	}

	/**
	 * Callback to create new rabbit context to handle received message
	 * @param {string} deliveryInfo - info about recived queue message
	 * @param {Record<string, any>}  payload - actually the body message
	 * @param {Function} method - next callback to execute anything, like call context (ack, nack...whatever)
	 * @returns {void} void
	 *
	 */
	private callback(
		deliveryInfo: DeliveryInfo,
		payload: Record<string, any>,
		message: Message,
		method: (event: Event, context: Context) => void,
	): void {
		const event = new Event(deliveryInfo.routingKey, payload);
		const context = new RabbitContext(this.channel, message);
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
