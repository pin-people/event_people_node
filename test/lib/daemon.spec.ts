import { Connection } from 'amqplib';
import { setEnvs } from '../../example/set-envs';
import { Config, Daemon, ListenersManager } from '../../lib';

describe('lib/daemon.ts', () => {
	let realProcessExit: (code: number) => never;
	beforeAll(() => {
		setEnvs();
		realProcessExit = process.exit;
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		process.exit = realProcessExit;
	});
	it('start() - Should start binding listeners', () => {
		const bindListenersSpy = jest
			.spyOn(ListenersManager, 'bindAllListeners')
			.mockImplementation(() => {
				return;
			});

		const bindSignalsSpy = jest
			.spyOn(Daemon, 'bindSignals')
			.mockImplementation(() => {
				return;
			});

		Daemon.start();

		expect(bindListenersSpy).toBeCalledTimes(1);
		expect(bindSignalsSpy).toBeCalledTimes(1);
	});

	it('bindSignals() - should respond to process events correctly', () => {
		const makeItExit = () => process.exit(0);

		const stopSpy = jest.spyOn(Daemon, 'stop');
		const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
			Daemon.stop();
			throw new Error('Exited');
		});

		Daemon.bindSignals();

		try {
			makeItExit();
		} catch (e) {
			expect(stopSpy).toBeCalledTimes(1);
			expect(exitSpy).toBeCalledTimes(1);
		}
	});

	it('stop() - should call broker close connection', async () => {
		new Config();
		const conn = {} as Connection;
		Daemon.config.broker.connection = conn;

		jest
			.spyOn(Config.broker, 'getConnection')
			.mockImplementation(
				() => new Promise<Connection>((resolve) => resolve({} as Connection)),
			);

		const closeSpy = jest
			.spyOn(Config.broker, 'closeConnection')
			.mockImplementation(() => {
				return conn;
			});

		Daemon.stop();

		expect(closeSpy).toBeCalledTimes(1);
	});
});
