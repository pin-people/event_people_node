import { ConsumeMessage } from 'amqplib';
import { Config, Emitter, Event, Listener } from '../lib/';

/**
 * with rabbit mq running, and ready to publish for exchange => RABBIT_EVENT_PEOPLE_TOPIC_NAME
 */
(async () => {
	await new Config().init();
	const eventName = 'message.*.schedule';
	Listener.on(eventName, (event: ConsumeMessage) => {
		console.log('consume event');
		console.log(JSON.parse(String(event.content)));
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
