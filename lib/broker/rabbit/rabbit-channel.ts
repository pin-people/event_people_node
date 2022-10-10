import { BaseChannel } from '../../listeners/base-listener';

export class RabbitChannel implements BaseChannel {
	ack(deliveryTag: string, acknowledge: boolean): void {}

	nack(deliveryTag: string, acknowledge: boolean, otp: boolean): void {}

	reject(deliveryTag: string, acknowledge: boolean): void {}
}
