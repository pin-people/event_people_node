import { BaseBroker } from './broker/base-broker';
import { RabbitBroker } from './broker/rabbit/rabbit-broker';

export class Config {
	static broker: BaseBroker;
	public static APP_NAME: string;
	public static TOPIC_NAME: string;
	public static VHOST_NAME: string;
	public static URL: string;
	public static FULL_URL: string;

	/**
	 *Setup for the Message broker that will handle events implementing BaseBroker
	 * @param {BaseBroker} broker
	 */
	constructor(
		url: string,
		vhost: string,
		appName: string,
		topicName: string,
		broker?: BaseBroker,
	) {
		Config.URL = url || 'amqp://admin:admin@127.0.0.1:5672';
		Config.VHOST_NAME = vhost || 'event-people';
		Config.APP_NAME = appName || 'event-people-node';
		Config.TOPIC_NAME = topicName || 'event-people-exchange';
		Config.FULL_URL = `${Config.URL}/${Config.VHOST_NAME}`;

		Config.broker = broker || new RabbitBroker();
	}

	/**
	 * Initialize getting the broker connection
	 */
	public static async init(): Promise<void> {
		await Config.broker.getConnection();
	}
	/**
	 * @returns {BaseBroker} BaseBroker
	 */
	public static getBroker(): BaseBroker {
		return Config.broker;
	}
}
