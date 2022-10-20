import { Event } from '..';
import { Listener } from '../listener';
import { CustomListener, ListenerConfig } from './base-listener';
import { Context } from '../context';

export class ListenersManager {
	public static listenerConfigurations: ListenerConfig[] = [];

	public static bindAllListeners(): void {
		return ListenersManager.listenerConfigurations.forEach((config) => {
			Listener.on(config.routingKey, (event: Event, context: Context) => {
				const listener = new CustomListener(context);
				listener.callback(config.method, event);
			});
		});
	}

	public static registerListenerConfiguration(config: ListenerConfig): void {
		ListenersManager.listenerConfigurations.push(config);
	}

	public static getListenerConfigurations() {
		return ListenersManager.listenerConfigurations;
	}
}
