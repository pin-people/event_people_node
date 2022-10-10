import { Config } from './config';
import { MissingAttributeError } from './utils/errors';

export class Listener {
	public static on(eventName: string, callback: Function) {
		if (eventName.length <= 0) throw new MissingAttributeError('eventName');
		Config.broker.consume(eventName, callback);
	}

	private consumedEventName(eventName: string) {
		return eventName.split('.').length <= 3 ? `${eventName}.all` : eventName;
	}
}
