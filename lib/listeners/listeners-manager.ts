import { Listener } from '../listener';

export class ListenersManager {
	public static listenerConfigurations: Listener[] = [];

	bindAllListeners() {
		return ListenersManager.listenerConfigurations.map(
			(listener: Listener) => {},
		);
	}

	addListener(listener: Listener) {}

	getListenerConfigurations() {
		return ListenersManager.listenerConfigurations;
	}
}
