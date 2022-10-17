import { Channel } from 'amqplib';
import { Context } from '../../context';

export class RabbitContext implements Context {
	constructor(
		private readonly channel: Channel,
		private readonly delivery_info: string,
	) {}
	success(): void {
		console.log('to implement rabbit success');
	}
	fail(): void {
		console.log('to implement rabbit fail');
	}
	reject(): void {
		console.log('to implement rabbit reject');
	}
}
