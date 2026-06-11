import { BaseBroker } from './broker/base-broker';
import { RabbitBroker } from './broker/rabbit/rabbit-broker';

export class Config {
	static broker: BaseBroker;
	public static APP_NAME: string;
	public static TOPIC_NAME: string;
	public static VHOST_NAME: string;
	public static URL: string;
	public static FULL_URL: string;
	public static maxAttempts: number;
	public static delayStrategy: string;
	public static dlqName: string;

	/**
	 *Setup for the Message broker that will handle events implementing BaseBroker
	 * @param {BaseBroker} broker
	 */
	constructor(broker?: BaseBroker) {
		Config.broker = broker || new RabbitBroker();
	}

	/**
	 * Setup for the Message broker that will handle events implementing BaseBroker
	 * Initialize getting the broker connection
	 * * @param {BaseBroker} broker
	 */
	public static async init(): Promise<void> {
		Config.URL = process.env.RABBIT_URL;
		Config.VHOST_NAME = process.env.RABBIT_EVENT_PEOPLE_VHOST;
		Config.APP_NAME = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
		Config.TOPIC_NAME = process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME;
		Config.FULL_URL = `${Config.URL}/${Config.VHOST_NAME}`;
		Config.maxAttempts = parseInt(
			process.env.RABBIT_EVENT_PEOPLE_MAX_RETRIES || '3',
			10,
		);
		Config.delayStrategy = 'exponential';
		Config.dlqName = `${Config.APP_NAME}_dlq`;

		Config.broker ? Config.broker : (Config.broker = new RabbitBroker());
		await Config.broker.getConnection();
	}

	/**
	 * Returns the retry configuration object
	 * @returns {{ maxAttempts: number; delayStrategy: string; dlqName: string }}
	 */
	public static getRetryConfig(): {
		maxAttempts: number;
		delayStrategy: string;
		dlqName: string;
	} {
		return {
			maxAttempts: Config.maxAttempts,
			delayStrategy: Config.delayStrategy,
			dlqName: Config.dlqName,
		};
	}
	/**
	 * @returns {BaseBroker} BaseBroker
	 */
	public static getBroker(): BaseBroker {
		return Config.broker;
	}
}
