import { Config } from './config';
import { Context } from './context';
import { Event } from './event';
import { MissingAttributeError } from './utils/errors';

export class Listener {
	/**
	 * Calls the broker consume method to receive stream events from certain queue.
	 * Optional retry parameters fall back to Config defaults when not provided.
	 * @param {string} eventName - string for queue event name
	 * @param callback - action callback function to execute after consuming the event
	 * @param {number} [maxAttempts] - max delivery attempts (default: Config.maxAttempts)
	 * @param {string} [delayStrategy] - 'exponential' or 'fixed' (default: Config.delayStrategy)
	 * @param {string} [dlqName] - dead-letter queue name (default: Config.dlqName)
	 */
	public static on(
		eventName: string,
		callback: (event: Event, context: Context) => void,
		maxAttempts?: number,
		delayStrategy?: string,
		dlqName?: string,
	): void {
		if (eventName.length <= 0) throw new MissingAttributeError('Event name');

		Config.broker.consume(eventName, callback, maxAttempts, delayStrategy, dlqName);
	}

	/**
	 * Normalizes event name with 'all' suffix
	 * @param {string} eventName string name for the event
	 * @returns {String} string
	 */
	private consumedEventName(eventName: string): string {
		return eventName.split('.').length <= 3 ? `${eventName}.all` : eventName;
	}
}
