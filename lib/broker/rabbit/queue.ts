import { Channel, ConsumeMessage } from 'amqplib';
import { Event } from '../../event';
import { Topic } from './topic';
import { Config } from '../../config';
import { Context } from '@lib/context';

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
		callback: (event: Event, context?: Context) => void,
	): Promise<ConsumeMessage> {
		const baseNameArr = routingKey.split('.');
		const baseName = baseNameArr.slice(0, 2).join('.');
		const name = this.queueName(`${baseName}.all`);
		this.channel.assertQueue(name);
		this.channel.bindQueue(name, Config.TOPIC_NAME, routingKey);

		return new Promise<ConsumeMessage>(async (resolve) => {
			await this.channel.consume(name, (event) => {
				const eventContent: Record<string, any> = JSON.parse(
					String(event.content),
				);
				callback(new Event(name, eventContent));
				resolve(event);
			});
		});
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
