import { Config } from './config';
import { ListenersManager } from './listeners';

export class Daemon {
	static config = Config;

	/**
	 * Starts the global listener Manager and BindSignals
	 * @returns void
	 */
	public static start(): void {
		ListenersManager.bindAllListeners();
		Daemon.bindSignals();
	}
	/**
	 * Start the system interuptions management processes
	 * @returns  void
	 */
	public static bindSignals(): void {
		process.stdin.resume();

		process.on('exit', () => {
			console.log('stopped due to exit system');
			Daemon.stop();
			process.exit(0);
		});

		process.on('SIGINT', () => {
			console.log('stopped due to CTRL+C');
			process.exit();
		});
	}

	/**
	 * Look for message broker connection and call his closeConnection
	 * @returns void
	 */
	public static stop(): void {
		if (Daemon.config.broker.connection) Daemon.config.broker.closeConnection();
	}
}
