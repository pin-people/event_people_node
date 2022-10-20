import { Config } from './config';
import { ListenersManager } from './listeners';

export class Daemon {
	static config = Config;

	public static async start(): Promise<void> {
		ListenersManager.bindAllListeners();
		Daemon.bindSignals();
	}

	public static bindSignals(): void {
		setInterval(() => {
			console.log(`
				Library Running
				\nList of Listenning channels:\n[${ListenersManager.getListenerConfigurations().map(
					(config) => config.routingKey,
				)}]
			`);
		}, 5000);

		process.stdin.resume();

		process.on('exit', () => {
			console.log('stopped due to exit system');
			Daemon.stop();
			process.exit(0);
		});

		process.on('SIGINT', () => {
			console.log('stopped due to CTRL+C');
			Daemon.stop();
		});
	}

	public static stop(): void {
		if (Daemon.config.broker.connection) Daemon.config.broker.closeConnection();
	}
}
