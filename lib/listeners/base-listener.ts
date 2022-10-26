import { Context } from '../context';
import { ListenersManager } from './listeners-manager';
import { Config } from '../config';

export type DeliveryInfo = {
	deliveryTag: string;
	routingKey: string;
};

export type ListenerConfig = {
	listener: typeof BaseListener;
	method: string;
	routingKey: string;
};

export class BaseListener {
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
				routingKey: this.fixedEventName(eventName, 'all'),
			});

			ListenersManager.registerListenerConfiguration({
				listener: this,
				method,
				routingKey: this.fixedEventName(eventName, appName),
			});
		} else
			ListenersManager.registerListenerConfiguration({
				listener: this,
				method,
				routingKey: this.fixedEventName(eventName, appName),
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

	/**
	 * Normalizes the event name based on the size of eventName
	 * @param {string} eventName
	 * @param {string} postFix
	 * @returns string
	 */
	private static fixedEventName(eventName: string, postFix: string): string {
		let routingKey = eventName;
		const split = eventName.split('.');
		const parts = split.length;

		if (parts <= 3) routingKey = `${eventName}.${postFix}`;
		else if (parts === 4) {
			const baseName = `${split.splice(0, 3).join('.')}`;
			routingKey = `${baseName}.${postFix}`;
		}
		return routingKey;
	}
}
