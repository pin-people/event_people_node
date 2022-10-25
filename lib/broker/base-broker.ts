import { Context } from '..';
import { Event } from '../event';
import { Connection } from './connection';

export interface BaseBroker {
	connection: Connection;
	consumers: any[];

	/**
	 * Open or return broker connection to the queue
	 * @returns {Promise<Connection>}
	 */
	getConnection(): Promise<Connection>;
	/**
	 * Consumes an event passing queue eventName and callback action to execute
	 * @param {string} eventName - string name for the event you're gonna listen to
	 * @param {Function} callback - callback that will be triggered after consuming event
	 * @returns {Promise<void>} - void
	 */
	consume(
		eventName: string,
		callback: (event: Event, context: Context) => void,
	): void;

	/**
	 * Emits a new event
	 * @param {Event} event - event message to send through some queue
	 * @returns {Promise<void>} void
	 */
	produce(event: Event): void;

	/**
	 * Disconnects from actual queue
	 */
	closeConnection(): void;
}
