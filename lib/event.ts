import { Config } from './config';
import { INVALID_EVENT_NAME, MissingAttributeError } from './utils/errors';

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
	body: Record<string, any> | string;
};

export class Event {
	private headers: EventHeaders;
	constructor(
		private name: string,
		private readonly body: Record<string, any> | string,
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
	 * @returns {Record<any, string>} - Record<any, string> | string
	 */
	getBody(): Record<any, string> {
		return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
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
	 * Normalizes the event name based on the size of eventName
	 * @param {string} eventName
	 * @param {string} postFix
	 * @returns string
	 */
	public static fixedEventName(eventName: string, postFix: string): string {
		const split = eventName.split('.');
		const parts = split.length;

		if (parts < 3) throw new MissingAttributeError(INVALID_EVENT_NAME);

		if (parts > 3) return eventName;
		else {
			const baseName = `${split.splice(0, 3).join('.')}`;
			eventName = `${baseName}.${postFix}`;
		}

		return eventName;
	}
}
