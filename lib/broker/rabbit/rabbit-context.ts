import { Channel } from 'amqplib';
import { Context } from '../../context';
import { Message } from 'amqplib/properties';

export class RabbitContext implements Context {
	constructor(
		private readonly channel: Channel,
		private readonly message: Message,
	) {}

	public success(): void {
		this.channel.ack(this.message, false);
	}

	public fail(): void {
		this.channel.nack(this.message, false, true);
	}

	public reject(): void {
		this.channel.reject(this.message, false);
	}
}
