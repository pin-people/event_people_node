import * as dotenv from 'dotenv';
dotenv.config();
import { BaseBroker } from './broker/base-broker';
import { RabbitBroker } from './broker/rabbit/rabbit-broker';

export class Config {
	static broker: BaseBroker;
	public static APP_NAME =
		process.env.RABBIT_EVENT_PEOPLE_APP_NAME || 'event-people';
	public static TOPIC_NAME =
		process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME || 'event-people-exchange';
	public static VHOST_NAME =
		process.env.RABBIT_EVENT_PEOPLE_VHOST || 'event-people';
	public static URL =
		process.env.RABBIT_URL || 'amqp://admin:admin@127.0.0.1:5672';
	public static fullURL = `${this.URL}/#${this.VHOST_NAME}`;

	/**
	 *Setup for the Message broker that will handle events implementing BaseBroker
	 * @param {BaseBroker} broker
	 */
	constructor(broker?: BaseBroker) {
		Config.broker = broker || new RabbitBroker();
	}

	/**
	 * Initialize getting the broker connection
	 */
	public async init(): Promise<void> {
		await Config.broker.getConnection();
	}
	/**
	 * @returns {BaseBroker} BaseBroker
	 */
	public static getBroker(): BaseBroker {
		return Config.broker;
	}
}
