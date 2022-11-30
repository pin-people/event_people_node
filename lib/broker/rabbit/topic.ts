import { Event } from '../../event';
import { Channel } from 'amqplib';
import { MissingAttributeError } from '../../utils/errors';
export class Topic {
	constructor(private readonly channel: Channel, readonly topic: string) {}
	/**
	 *Returns the topic string
	 * @returns {String} topic string
	 */
	public getTopic(): string {
		return this.topic;
	}

	/**
	 *Returns the queue channel
	 * @returns {Channel} Channel
	 */
	getChannel(): Channel {
		return this.channel;
	}

	/**
	 * Publish a message event through the queue channel
	 * @param {EVent} event - message event that will be produced
	 */
	async produce(event: Event): Promise<void> {
		console.log('sdlkasdlasdlasdasd', this.topic);
		if (!this.getTopic() || this.topic.length < 1)
			throw new MissingAttributeError('topic');

		const content = Buffer.from(JSON.stringify(event.payload()));

		this.channel.publish(this.topic, event.getName(), content, {
			contentType: 'application/json',
			type: 'topic',
		});
	}
}
