import { Config } from './config';
import { Event } from './event';
import { MissingAttributeError } from './utils/errors';

export class Emitter {
	/**
	 *Emits each passed event, calling broker produce method
	 * @param {Event[]} events - Array of events to emitt
	 */
	public static trigger(...events: Event[]): void {
		events.forEach((event, index) => {
			if (!event.getBody())
				throw new MissingAttributeError(`Event body on position ${index}`);

			if (!event.getName())
				throw new MissingAttributeError(`Event name on position ${index}`);

			Config.broker.produce(event);
		});
	}
}
