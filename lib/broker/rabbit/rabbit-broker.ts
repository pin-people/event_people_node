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

	public async getConnection(): Promise<Connection> {
		if (!this.connection) {
			this.connection = await connect(Config.URL);
		}
		this.channel = await this.getChannel();
		this.topic = new Topic(this.channel, Config.TOPIC_NAME);
		this.queue = new Queue(this.channel, this.topic);
		console.log('connection stablished');
		return this.connection;
	}

	private async getChannel() {
		if (!this.channel) return this.connection.createChannel();
		return this.channel;
	}

	public async consume(eventName: string, callback: Function): Promise<void> {
		this.queue.subscribe(eventName, callback);
	}

	public async produce(event: Event): Promise<void> {
		this.topic.produce(event);
	}

	public async closeConnection(): Promise<void> {
		await this.connection.close();
	}
}
