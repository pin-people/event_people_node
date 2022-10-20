import { Channel, ConsumeMessage, MessageProperties } from 'amqplib';
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
	 * @param {Function}  callback - function to execute actions after event recieved
	 * @returns {Promise<ConsumeMessage>}
	 *
	 */
	async subscribe(
		routingKey: string,
		callback: (event: Event, context: Context) => void,
	): Promise<ConsumeMessage> {
		const baseNameArr = routingKey.split('.');
		const baseName = baseNameArr.slice(0, 2).join('.');
		const name = this.queueName(`${baseName}.all`);
		this.channel.assertQueue(name);
		this.channel.bindQueue(name, Config.TOPIC_NAME, routingKey);

		return new Promise<ConsumeMessage>(async (resolve) => {
			await this.channel.consume(name, (event: ConsumeMessage) => {
				const eventPayload: Record<string, any> = JSON.parse(
					String(event.content),
				);
				const deliveryInfo: DeliveryInfo = {
					deliveryTag: String(event.fields.deliveryTag),
					routingKey: event.fields.routingKey,
				};

				const properties = event.properties;

				this.callback(deliveryInfo, properties, eventPayload, callback);
				resolve(event);
			});
		});
	}

	/**
	 * Callback to create new rabbit context to handle recieved message
	 * @param {string} deliveryInfo - info about recived queue message
	 * @param {MessageProperties} properties - additional info about recieved message
	 * @param {Record<string, any>}  payload - actually the body message
	 * @param {Function} method - next callback to execute anything, like call context (ack, nack...whatever)
	 * @returns {void}
	 *
	 */
	private callback(
		deliveryInfo: DeliveryInfo,
		properties: MessageProperties,
		payload: Record<string, any>,
		method: (event: Event, context: Context) => void,
	) {
		const eventName = deliveryInfo.routingKey;
		const event = new Event(eventName, payload);
		const context = new RabbitContext(this.channel, deliveryInfo);
		method(event, context);
	}

	private queueOptions() {
		return { durable: true };
	}

	/**
	 * Returns the full queue name
	 * @param {string}  routingKey  - queue path string
	 * @returns {string}
	 */
	private queueName(routingKey: string) {
		return `${this.config.APP_NAME.toLocaleLowerCase()}-#${routingKey.toLocaleLowerCase()}`;
	}
}
