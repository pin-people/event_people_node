import { Config, Emitter, Event } from '../lib';

(async () => {
	await new Config().init();

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
	body = { message: 'Secret' };

	events.push(new Event(eventName, body));

	eventName = 'resource.origin.action';
	body = { bo: 'dy' };
	const schemaVersion = 4.2;

	const event = new Event(eventName, body, schemaVersion);

	console.log('Sending messsages.');

	Emitter.trigger([event]);
	Emitter.trigger(events);

	console.log('Mesages sent!');

	Config.broker.closeConnection();
})();
