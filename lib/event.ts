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
		private body: Record<string, any>,
		private readonly schemaVersion = 1.0,
	) {}

	payload() {
		return {
			headers: this.headers,
			body: this.body,
		};
	}

	hasBody() {
		return this.body !== undefined;
	}

	hasName() {
		return this.name !== undefined;
	}

	private buildPayload() {
		this.headers = this.body['headers'];
		this.body = this.body['body'];
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
