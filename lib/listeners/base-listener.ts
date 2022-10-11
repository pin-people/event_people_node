import { Context } from '../context';

export interface BaseChannel {
	ack(deliveryTag: string, acknowledge: boolean): void;
	nack(deliveryTag: string, acknowledge: boolean, otp: boolean): void;
	reject(deliveryTag: string, acknowledge: boolean): void;
}

export type DeliveryInfo = {
	deliveryTag: string;
	routingKey: string;
};

export class BaseListener implements Context {
	constructor(
		private readonly channel: BaseChannel,
		private readonly deliveryInfo: DeliveryInfo,
	) {}

	callback() {}

	success() {
		this.channel.ack(this.deliveryInfo.deliveryTag, false);
		this.channel.ack(this.deliveryInfo.deliveryTag, false);
	}

	fail() {
		this.channel.nack(this.deliveryInfo.deliveryTag, false, true);
	}

	reject() {
		this.channel.reject(this.deliveryInfo.deliveryTag, false);
	}
}
