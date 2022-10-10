import { Channel, ConsumeMessage } from 'amqplib';
import { Event } from '../../event';
import { DeliveryInfo } from '../../listeners/base-listener';
import { Topic } from './topic';
import { Config } from '../../config';

export class Queue {
	private config = Config;
	constructor(private channel: Channel, private topic: Topic) {}

	/**
	 * Makes a subscription to receive events for a certain routingKey
	 * @param {string} routingKey - name path for the queue. Example: messages.*.all
	 * @param {Function}  callback - function to execute actions after event recieved
	 * @returns {Promise<ConsumeMessage>}
	 *
	 */

	async subscribe(routingKey: string, callback: Function) {
		let baseName: string;
		const baseNameArr = routingKey.split('.');
		baseName = baseNameArr.slice(0, 2).join('.');
		const name = this.queueName(`${baseName}.all`);
		this.channel.assertQueue(name);
		this.channel.bindQueue(name, Config.TOPIC_NAME, routingKey);

		return new Promise<ConsumeMessage>(async (resolve, reject) => {
			await this.channel.consume(name, (event) => {
				console.log(JSON.parse(String(event?.content)));
				resolve(event);
			});
		});
	}

	private callback(
		deliveryInfo: DeliveryInfo,
		properties: any,
		payload: Record<string, any>,
		func: Function,
	) {
		const eventName = deliveryInfo.routingKey;
		const event = new Event(eventName, payload);
		// func(event, context);
	}

	private queueOptions() {
		return { durable: true };
	}

	/**
	 * Returns the full queue name
	 * @param {string}  routingKey  - queue path string
	 * @returns{string}
	 */
	private queueName(routingKey: string) {
		return `${this.config.APP_NAME.toLocaleLowerCase()}-#${routingKey.toLocaleLowerCase()}`;
	}
}
