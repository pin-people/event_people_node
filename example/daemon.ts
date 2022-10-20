import { Config, Context, Daemon, Emitter, Event } from '../lib';
import { BaseListener } from '../lib/listeners/base-listener';

class CustomEventListener extends BaseListener {
	public test(event: Event) {
		console.log(
			`TEST ${JSON.stringify(event.getBody())} for ${event.getName()}`,
		);
		this.success();
	}

	public static test2(event: Event) {
		console.log(`TEST 2 ${event.getBody()} for ${event.getName()}`);
	}
}

(async () => {
	await new Config().init();

	const context: Context = {
		success() {},
		fail() {},
		reject() {},
	};
	const custom = new CustomEventListener(context);
	custom.bindEvent(custom.test, 'message.*.schedule');

	setTimeout(() => {
		const events: Event[] = [
			new Event('#message.*.schedule.#all', {
				msg: 'hello goddess world!!!!!!',
			}),
		];
		Emitter.trigger(events);
	}, 6000);

	Daemon.start();
})();
