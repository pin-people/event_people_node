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
	constructor(broker?: BaseBroker) {
		Config.URL = process.env.RABBIT_URL;
		Config.VHOST_NAME = process.env.RABBIT_EVENT_PEOPLE_VHOST;
		Config.APP_NAME = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
		Config.TOPIC_NAME = process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME;
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
