import { connect, Channel, Connection } from 'amqplib';

import { Config } from '../../config';
import { Event } from '../../event';
import { BaseBroker } from '../base-broker';
import { Queue } from './queue';
import { Topic } from './topic';

export class RabbitBroker implements BaseBroker {
	connection: Connection;
	consumers: [];
	private channel: Channel;
	private session: any;

	private queue: Queue;
	private topic: Topic;

	getConsumers() {}

	async getConnection(): Promise<Connection> {
		if (!this.connection) {
			this.connection = await connect(Config.URL);
			this.channel = await this.getChannel();
			this.topic = new Topic(this.channel, Config.TOPIC_NAME);
			this.queue = new Queue(this.channel, this.topic);
		}
		console.log('connection stablished');
		return this.connection;
	}

	async consume(eventName: string, callback: Function): Promise<void> {
		await this.getConnection();
		this.queue.subscribe(eventName, callback);
	}

	async produce(events: Event[]): Promise<void> {}

	async closeConnection(): Promise<void> {
		await this.connection.close();
	}

	private async getChannel() {
		if (!this.channel) return this.connection.createChannel();
		return this.channel;
	}
}
