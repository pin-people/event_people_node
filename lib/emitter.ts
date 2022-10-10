import { Config } from './config';
import { Event } from './event';
import { MissingAttributeError } from './utils/errors';

export class Emitter {
	trigger(events: Event[]) {
		events.forEach((event, index) => {
			if (!event.hasBody())
				throw new MissingAttributeError(`Event body on position ${index}`);

			if (!event.hasName())
				throw new MissingAttributeError(`Event name on position ${index}`);
		});

		Config.broker.produce(events);
	}
}
