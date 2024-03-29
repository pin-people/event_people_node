import { Channel, Connection, Message } from 'amqplib';
import { Context, Event } from '../../lib';
import { Queue } from '../../lib/broker/rabbit/queue';

export const mockQueue: Partial<Queue> = {};

export const mockChannel: Partial<Channel> = {
	assertQueue: jest.fn(),
	bindQueue: jest.fn(),
	prefetch: jest.fn(),
	publish: jest.fn(),
	consume: jest.fn(),
	ack: jest.fn(),
	nack: jest.fn(),
	reject: jest.fn(),
};

export const mockConnection: Partial<Connection> = {
	createChannel: jest.fn().mockResolvedValueOnce(mockChannel),
	close: jest.fn(),
};

export class MockContext implements Context {
	channel: Channel;
	message: Message;
	constructor(channel: Channel, message: Message) {
		this.channel = channel;
		this.message = message;
	}
	success() {
		console.log('mock success context');
	}
	fail() {
		console.log('mock failed context');
	}
	reject() {
		console.log('mock rejected context');
	}
}

export const mockSuccessCallback = (event: Event, context: Context) => {
	console.log(event.getName());
	context.success();
};

export const mockFailedCallback = (event: Event, context: Context) => {
	console.log(event.getName());
	context.fail();
};

export const mockRejectCallback = (event: Event, context: Context) => {
	console.log(event.getName());
	context.reject();
};
