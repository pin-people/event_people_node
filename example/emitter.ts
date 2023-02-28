import { Config, Emitter, Event } from '../lib';
import { setEnvs } from './set-envs';

setEnvs();

(async () => {
	await Config.init();

	const events: Event[] = [];
	let eventName = 'resource.custom.pay';
	let body: Record<string, any> = { amount: 1500, name: 'john' };

	events.push(new Event(eventName, body));

	eventName = 'resource.custom.receive';
	body = { amount: 35, name: 'Peter' };

	events.push(new Event(eventName, body));

	eventName = 'resource.custom.receive';
	body = { amount: 350, name: 'George' };

	events.push(new Event(eventName, body));

	eventName = 'resource.custom.receive';
	body = { amount: 550, name: 'James' };

	events.push(new Event(eventName, body));

	eventName = 'resource.custom.private.service';
	const stringBody = `{ "message": "Secret"}`;

	events.push(new Event(eventName, stringBody));

	eventName = 'resource.origin.action.all';
	body = { bo: 'dy' };
	const schemaVersion = 4.2;

	const event = new Event(eventName, body, schemaVersion);

	console.log('Sending messsages.');

	Emitter.trigger(event);
	Emitter.trigger(...events);

	console.log('Mesages sent!');

	setTimeout(() => Config.broker.closeConnection(), 500);
})();
