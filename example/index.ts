import { Context } from '../lib/context';
import { Config, Emitter, Event, Listener } from '../lib/';

(async () => {
	await new Config().init();
	const eventName = 'message.*.schedule';
	Listener.on(eventName, (event: Event, context: Context) => {
		console.log('consume event');
		console.log(event.payload());
		context.success(event);
	});

	const events: Event[] = [
		new Event('message.*.schedule', {
			msg: 'hello goddess world',
		}),
		new Event('message.*.schedule', {
			msg: 'hello goddess world 2',
		}),
	];

	Emitter.trigger(events);
})();
