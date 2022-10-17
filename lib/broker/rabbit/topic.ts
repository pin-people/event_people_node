import { Config } from '../../config';
import { Event } from '../../event';
import { Channel } from 'amqplib';

export class Topic {
	constructor(private readonly channel: Channel, readonly topic: string) {}

	getTopic() {
		return this.topic;
	}

	getChannel() {
		return this.channel;
	}

	produce(event: Event) {
		this.channel.publish(
			Config.TOPIC_NAME,
			event.getName(),
			Buffer.from(JSON.stringify(event.payload())),
			{
				contentType: 'application/json',
			},
		);
	}
}
