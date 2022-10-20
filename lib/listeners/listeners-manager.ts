import { Event } from '..';
import { Listener } from '../listener';
import { Context } from '../context';
import { ListenerConfig, BaseListener } from './base-listener';

export class ListenersManager {
	public static listenerConfigurations: ListenerConfig[] = [];
	/**
	 * For each listener added to listenerConfigurations, finds the right
	 * method property on this listener attatched and use it as callback for the incoming event
	 * @returns void
	 */
	public static bindAllListeners(): void {
		return ListenersManager.listenerConfigurations.forEach((config) => {
			Listener.on(config.routingKey, (event: Event, context: Context) => {
				const instance: BaseListener = new config.listener(context);
				instance[config.method](event);
			});
		});
	}

	/**
	 * Include listeners to the global listener configurations array
	 * @param {ListenerConfig} config
	 * @returns void
	 */
	public static registerListenerConfiguration(config: ListenerConfig): void {
		ListenersManager.listenerConfigurations.push(config);
	}

	/**
	 * Return all ListenerConfig from the global array
	 * @returns {ListenerConfig[]} ListenerConfig[]
	 */
	public static getListenerConfigurations(): ListenerConfig[] {
		return ListenersManager.listenerConfigurations;
	}
}
