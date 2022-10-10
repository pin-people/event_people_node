import { Listener } from '../lib/listener';

/**
 * with rabbit mq running, and ready to publish for exchange => RABBIT_EVENT_PEOPLE_TOPIC_NAME
 */
const eventName = 'message.*.schedule';
Listener.on(eventName, (event: Record<string, any>) => {
	console.log('resolved event', event);
});
