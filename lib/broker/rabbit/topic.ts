import { Channel } from 'amqplib';

export class Topic {
	constructor(private readonly channel: Channel, readonly topic: string) {}

	getTopic() {}

	getChannel() {}

	produce() {}

	topicOptions() {}
}
