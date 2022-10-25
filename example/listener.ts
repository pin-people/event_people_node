import { Context } from '../lib/context';
import { Config, Emitter, Event, Listener } from '../lib';

(async () => {
	await new Config().init();

	const eventName = 'resource.custom.pay';

	console.log('Start receiving messages');

	Listener.on(eventName, (event: Event, context: Context) => {
		console.log(`-	Received a message from ${event.getName()}`);
		console.log(`	Message: ${JSON.stringify(event.getBody())}`);
		context.success();
	});

	const events = [new Event('resource.origin.action', { message: 'amqplib' })];
	Emitter.trigger(events);
})();
