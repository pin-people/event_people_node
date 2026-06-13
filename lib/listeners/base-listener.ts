import { Context } from '../context';
import { ListenersManager } from './listeners-manager';
import { Config } from '../config';
import { Event } from '..';

export type DeliveryInfo = {
	deliveryTag: string;
	routingKey: string;
};

export type ListenerConfig = {
	listener: typeof BaseListener;
	method: string;
	eventName: string;
};

export class BaseListener {
	/**
	 * Optional class-level retry settings. When declared on a subclass, they override Config defaults
	 * for that specific listener. All are optional — absent attributes fall back to Config defaults.
	 */
	static maxAttempts?: number;
	static initialDelay?: number;
	static delayStrategy?: string;
	static dlqName?: string;

	public context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	/**
	 * Address some method name for a event message and add it to global ListenerManager
	 * @param {string} method - name for the class method tha will handle incoming events
	 * @param {string} eventName - name for the queue event message
	 */

	public static bindEvent(method: string, eventName: string) {
		const appName = Config.APP_NAME;
		if (eventName.split('.').length <= 3) {
			ListenersManager.registerListenerConfiguration({
				listener: this,
				method,
				eventName: Event.fixedEventName(eventName, 'all'),
			});

			ListenersManager.registerListenerConfiguration({
				listener: this,
				method,
				eventName: Event.fixedEventName(eventName, appName),
			});
		} else
			ListenersManager.registerListenerConfiguration({
				listener: this,
				method,
				eventName: Event.fixedEventName(eventName, appName),
			});
	}

	/**
	 * Confirm message delivery and make the handshake with the channel
	 * @returns void
	 */
	public success(): void {
		this.context.success();
	}

	/**
	 * Deny message delivery and handshake with the channel
	 * @returns void
	 */
	public fail(): void {
		this.context.fail();
	}

	/**
	 * Reject the message and handshake with the channel
	 * @returns void
	 */
	public reject(): void {
		this.context.reject();
	}
}
