import { Config, Daemon, Event } from '../lib';
import { BaseListener, ListenersManager } from '../lib/listeners';

(async () => {
	class CustomEventListener extends BaseListener {
		pay(event: Event) {
			console.log(
				`Received ${JSON.stringify(event.getBody())} for ${
					event.getBody()['name']
				} ~> ${event.getName()}`,
			);
			this.success();
		}
		receive(event: Event) {
			if (+event.getBody()['ammount'] > 500) {
				console.log(
					`Received ${event.getBody()['amount']} from ${
						event.getBody()['name']
					} ~> ${event.getName}`,
				);
				this.success();
			} else {
				console.log('[Consumer] Got SKIPPED message');
				return this.reject();
			}
		}

		privateChannel(event: Event) {
			console.log(
				`[consumer] Got a private message: ${
					event.getBody()['message']
				} ~> ${event.getName()}`,
			);
		}
	}

	CustomEventListener.bindEvent('pay', 'resource.custom.pay');
	CustomEventListener.bindEvent('receive', 'resource.custom.receive');
	CustomEventListener.bindEvent(
		'privateChannel',
		'resource.custom.private.service',
	);

	await new Config().init();
	console.log('****************** Daemon Ready ******************');
	Daemon.start();

	setInterval(() => {
		console.log(`
			Library Running
			\nList of Listenning channels:\n[${ListenersManager.getListenerConfigurations().map(
				(config) => config.routingKey,
			)}]
		`);
	}, 5000);
})();
