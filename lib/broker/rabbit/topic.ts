import { Channel } from 'amqplib';

export class Topic {
	constructor(private channel: Channel, topic: string) {}

	getTopic() {}

	getChannel() {}

	produce() {}

	topicOptions() {}
}
