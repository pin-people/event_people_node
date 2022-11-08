import { Context } from '../lib/';
import { Config, Event, Listener } from '../lib';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from './constants';

(async () => {
	await new Config(
		RABBIT_URL,
		RABBIT_EVENT_PEOPLE_VHOST,
		RABBIT_EVENT_PEOPLE_APP_NAME,
		RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	).init();

	const eventName = 'resource.origin.action';

	console.log('Start receiving messages');

	Listener.on(eventName, (event: Event, context: Context) => {
		console.log(`-		Received a message from ${event.getName()}`);
		console.log(`-  	Message headers ${JSON.stringify(event.getHeaders())}`);
		console.log(`-		Message: ${JSON.stringify(event.getBody())}`);
		context.success();
	});
})();
