import { Config, Daemon, Emitter, Event } from '../lib';
import { BaseListener } from '../lib/listeners';

(async () => {
	await new Config().init();

	class CustomEventListener extends BaseListener {
		test(event: Event) {
			console.log(
				`TEST ${JSON.stringify(event.getBody())} for ${event.getName()}`,
			);
			this.success();
		}
		test2(event: Event) {
			console.log(
				`TEST 2 ${JSON.stringify(event.getBody())} for ${event.getName()}`,
			);
			this.reject();
		}
	}

	CustomEventListener.bindEvent('test', 'message.*.schedule');
	CustomEventListener.bindEvent('test2', 'message.*.sent');

	setTimeout(() => {
		const events: Event[] = [
			new Event('message.*.schedule', {
				msg: 'new message for ya folks',
			}),
		];
		Emitter.trigger(events);
	}, 6000);

	setInterval(() => {
		const events: Event[] = [
			new Event('message.*.sent', {
				msg: 'take this buddy',
			}),
		];
		Emitter.trigger(events);
	}, 5000);

	Daemon.start();
})();
