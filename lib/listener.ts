import { Config } from './config';
import { Context } from './context';
import { Event } from './event';
import { BaseListener } from './listeners/base-listener';
import { MissingAttributeError } from './utils/errors';

export class Listener {
	/**
	 * Calls the broker consume method to receive stream events from certain queue.
	 * Retry configuration is read from the listener class attributes (if provided),
	 * falling back to Config defaults.
	 * @param {string} eventName - string for queue event name
	 * @param callback - action callback function to execute after consuming the event
	 * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
	 */
	public static on(
		eventName: string,
		callback: (event: Event, context: Context) => void,
		listenerClass?: typeof BaseListener,
	): void {
		if (eventName.length <= 0) throw new MissingAttributeError('Event name');

		Config.broker.consume(eventName, callback, listenerClass);
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
