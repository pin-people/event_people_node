import { Config } from './config';

export class Daemon {
	config = Config;
	constructor() {}

	start() {
		this.config.broker.getConnection();
	}

	stop() {
		this.config.broker.closeConnection();
	}

	bindSignals() {}
}
