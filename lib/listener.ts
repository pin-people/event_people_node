import { Config } from './config';
import { Context } from './context';
import { Event } from './event';
import { MissingAttributeError } from './utils/errors';

export class Listener {
	public static on(
		eventName: string,
		callback: (event: Event, context: Context) => void,
	) {
		if (eventName.length <= 0) throw new MissingAttributeError('Event name');

		Config.broker.consume(eventName, callback);
	}

	private consumedEventName(eventName: string) {
		return eventName.split('.').length <= 3 ? `${eventName}.all` : eventName;
	}
}
