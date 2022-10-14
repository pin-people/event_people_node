import { Config } from './config';

export type EventHeaders = {
	appName: string;
	resource: string;
	origin: string;
	action: string;
	destination: string;
	schemaVersion: number;
};

export class Event {
	private headers: EventHeaders;
	constructor(
		private name: string,
		private readonly body: Record<string, any>,
		private readonly schemaVersion = 1.0,
	) {}

	payload() {
		return {
			headers: this.headers,
			body: this.body,
		};
	}

	getBody() {
		return this.body;
	}

	getName() {
		return this.name;
	}

	private generateHeaders() {
		const headerSpec = this.name.split('.');

		this.headers = {
			appName: Config.APP_NAME,
			resource: headerSpec[0],
			origin: headerSpec[1],
			action: headerSpec[2],
			destination: headerSpec[3],
			schemaVersion: this.schemaVersion,
		};
	}

	private fixName() {
		if (this.name.split('.').length != 3) this.name = `${this.name}.all`;
	}
}
