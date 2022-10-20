import { Context } from '../context';
import { ListenersManager } from './listeners-manager';
import { Config } from '../config';
import { Event } from '..';

export type DeliveryInfo = {
	deliveryTag: string;
	routingKey: string;
};

export type ListenerConfig = {
	listener: BaseListener;
	method: (event: any) => void;
	routingKey: string;
};

export abstract class BaseListener implements Context {
	public context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	public bindEvent(method: (event: Event) => void, eventName: string) {
		const appName = Config.APP_NAME;
		ListenersManager.registerListenerConfiguration({
			listener: this,
			method,
			routingKey: this.fixedEventName(eventName, 'all'),
		});

		ListenersManager.registerListenerConfiguration({
			listener: this,
			method,
			routingKey: this.fixedEventName(eventName, appName),
		});
	}

	public success() {
		this.context.success();
	}

	public fail() {
		this.context.fail();
	}

	public reject() {
		this.context.reject();
	}

	public callback(method: (event: Event) => void, event: Event) {
		method(event);
	}

	private fixedEventName(eventName: string, postFix: string): string {
		const split = eventName.split('.');
		const parts = split.length;

		if (parts <= 3) return `#${eventName}.#${postFix}`;
		if (parts === 4) return `#${split.splice(0, 3).join('.')}.#${postFix}`;
		return eventName;
	}
}

export class CustomListener extends BaseListener {
	public context: Context;
	constructor(context: Context) {
		super(context);
		this.context = context;
	}
}
