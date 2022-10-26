import { Context } from '../lib/context';
import { Config, Emitter, Event, Listener } from '../lib';

(async () => {
	await new Config().init();

	const eventName = 'resource.origin.action';

	console.log('Start receiving messages');

	Listener.on(eventName, (event: Event, context: Context) => {
		console.log(`-		Received a message from ${event.getName()}`);
		console.log(`-  	Message headers ${JSON.stringify(event.getHeaders())}`);
		console.log(`-		Message: ${JSON.stringify(event.getBody())}`);
		context.success();
	});
})();
