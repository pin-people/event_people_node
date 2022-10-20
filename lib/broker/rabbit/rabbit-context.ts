import { DeliveryInfo } from '@lib/listeners';
import { Channel } from 'amqplib';
import { Context } from '../../context';
import { Message } from 'amqplib/properties';

export class RabbitContext implements Context {
	constructor(
		private readonly channel: Channel,
		private readonly deliveryInfo?: DeliveryInfo,
	) {}
	public success(eventMessage: Message): void {
		console.log('rabbit success', {
			...eventMessage,
			deliveryInfo: this.deliveryInfo,
		});
		this.channel.ack({
			...eventMessage,
			fields: {
				...eventMessage.fields,
				deliveryTag: +this.deliveryInfo.deliveryTag,
			},
		});
	}
	public fail(eventMessage: Message): void {
		this.channel.nack({
			...eventMessage,
			fields: {
				...eventMessage.fields,
				deliveryTag: +this.deliveryInfo.deliveryTag,
			},
		});
		console.log('rabbit nack');
	}
	public reject(eventMessage: Message): void {
		this.channel.reject({
			...eventMessage,
			fields: {
				...eventMessage.fields,
				deliveryTag: +this.deliveryInfo.deliveryTag,
			},
		});
		console.log('rabbit reject');
	}
}
