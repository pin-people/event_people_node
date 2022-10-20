import { Context } from '@lib/context';
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
	private queue: Queue;
	private topic: Topic;

	/**
	 *Open the rabbitmq connection if it's not properly UP already and returns it
	 * @returns {Promise<Connection>}
	 */
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

	/**
	 *Returns channel instance
	 * @returns {Promise<Channel>}
	 */
	private async getChannel() {
		if (!this.channel) return this.connection.createChannel();
		return this.channel;
	}

	/**
	 * @param {string} eventName - string name for the event you're gonna listen to
	 * @param {Function} callback - callback that will be produced after consume
	 * @returns {Promise<void>}
	 */
	public async consume(
		eventName: string,
		callback: (event: Event, context: Context) => void,
	): Promise<void> {
		this.queue.subscribe(eventName, callback);
	}

	/**
	 * @param {Event} event - event message to send into some queue
	 * @returns {Promise<void>}
	 */
	public async produce(event: Event): Promise<void> {
		this.topic.produce(event);
	}

	/**
	 * Closes the actual connection
	 * @returns {Promise<void>}
	 */
	public async closeConnection(): Promise<void> {
		await this.connection.close();
	}
}
