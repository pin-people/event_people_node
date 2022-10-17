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

	constructor(broker?: BaseBroker) {
		Config.broker = broker || new RabbitBroker();
	}

	public async init(): Promise<void> {
		await Config.broker.getConnection();
	}

	public static getBrocker() {
		return Config.broker;
	}
}
