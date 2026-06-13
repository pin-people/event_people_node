import { BaseBroker } from './broker/base-broker';
import { RabbitBroker } from './broker/rabbit/rabbit-broker';

export type RetryConfigOptions = {
	maxAttempts?: number;
	initialDelay?: number;
	delayStrategy?: string;
	dlqName?: string;
};

export class Config {
	static broker: BaseBroker;
	public static APP_NAME: string;
	public static TOPIC_NAME: string;
	public static VHOST_NAME: string;
	public static URL: string;
	public static FULL_URL: string;
	public static maxAttempts: number = 3;
	public static initialDelay: number = 1000;
	public static delayStrategy: string = 'exponential';
	public static dlqName: string;

	/**
	 * Setup for the Message broker that will handle events implementing BaseBroker
	 * @param {BaseBroker} broker
	 */
	constructor(broker?: BaseBroker) {
		Config.broker = broker || new RabbitBroker();
	}

	/**
	 * Setup for the Message broker that will handle events implementing BaseBroker
	 * Initialize getting the broker connection
	 * @param {BaseBroker} broker
	 */
	public static async init(): Promise<void> {
		Config.URL = process.env.RABBIT_URL;
		Config.VHOST_NAME = process.env.RABBIT_EVENT_PEOPLE_VHOST;
		Config.APP_NAME = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
		Config.TOPIC_NAME = process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME;
		Config.FULL_URL = `${Config.URL}/${Config.VHOST_NAME}`;

		// Apply hardcoded defaults only if not already set via configure()
		if (Config.maxAttempts === undefined) Config.maxAttempts = 3;
		if (Config.initialDelay === undefined) Config.initialDelay = 1000;
		if (Config.delayStrategy === undefined) Config.delayStrategy = 'exponential';
		if (!Config.dlqName) Config.dlqName = `${Config.APP_NAME}_dlq`;

		Config.broker ? Config.broker : (Config.broker = new RabbitBroker());
		await Config.broker.getConnection();
	}

	/**
	 * Sets global retry defaults in code. Optional — when not called, hardcoded defaults apply.
	 * Connection attributes (appName, url, vhost, topic) are always read from environment variables.
	 * @param {RetryConfigOptions} options - { maxAttempts, initialDelay, delayStrategy, dlqName }
	 */
	public static configure(options: RetryConfigOptions): void {
		if (options.maxAttempts !== undefined) Config.maxAttempts = options.maxAttempts;
		if (options.initialDelay !== undefined) Config.initialDelay = options.initialDelay;
		if (options.delayStrategy !== undefined) Config.delayStrategy = options.delayStrategy;
		if (options.dlqName !== undefined) Config.dlqName = options.dlqName;
	}

	/**
	 * Returns the active global retry configuration.
	 * @returns {{ maxAttempts: number; initialDelay: number; delayStrategy: string; dlqName: string }}
	 */
	public static getRetryConfig(): {
		maxAttempts: number;
		initialDelay: number;
		delayStrategy: string;
		dlqName: string;
	} {
		return {
			maxAttempts: Config.maxAttempts ?? 3,
			initialDelay: Config.initialDelay ?? 1000,
			delayStrategy: Config.delayStrategy ?? 'exponential',
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
