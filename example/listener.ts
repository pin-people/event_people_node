import { Context } from '../lib/';
import { Config, Event, Listener } from '../lib';
import { setEnvs } from './set-envs';

setEnvs();

(async () => {
	new Config();
	await Config.init();

	const eventName = 'resource.origin.action';

	console.log('Start receiving messages');

	Listener.on(eventName, (event: Event, context: Context) => {
		console.log(`-		Received a message from ${event.getName()}`);
		console.log(`-  	Message headers ${JSON.stringify(event.getHeaders())}`);
		console.log(`-		Message: ${JSON.stringify(event.getBody())}`);
		context.success();
	});
})();
