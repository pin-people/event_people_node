import { Config } from './config';

export type EventHeaders = {
	appName: string;
	resource: string;
	origin: string;
	action: string;
	destination: string;
	schemaVersion: number;
};

export type EventPayload = {
	headers: EventHeaders;
	body: Record<string, any>;
};

export class Event {
	private headers: EventHeaders;
	constructor(
		private name: string,
		private readonly body: Record<string, any>,
		private readonly schemaVersion = 1.0,
	) {}

	/**
	 * Constructs eventPayload, containing headers and the body for this event
	 * @returns {EventPayload} - EventPayload
	 */
	payload(): EventPayload {
		return {
			headers: this.getHeaders(),
			body: this.body,
		};
	}
	/**
	 * Returns the event body
	 * @returns {Record<any, string>} - Record<any, string>
	 */
	getBody(): Record<any, string> {
		return this.body;
	}

	/**
	 * Returns full event name
	 * @returns {string} - string
	 */
	getName(): string {
		return this.name;
	}

	/**
	 * Builds the headers based on the app_name and event name and schemaVersion
	 * @returns {EventHeaders} - EventHeaders
	 */
	getHeaders(): EventHeaders {
		const headerSpec = this.name.split('.');

		this.headers = {
			appName: Config.APP_NAME,
			resource: headerSpec[0],
			origin: headerSpec[1],
			action: headerSpec[2],
			destination: headerSpec[3],
			schemaVersion: this.schemaVersion,
		};

		return this.headers;
	}

	/**
	 * Adds a suffix 'all' for event name wich has length != than 3
	 */
	private fixName(): void {
		if (this.name.split('.').length < 4) this.name = `${this.name}.all`;
	}
}
