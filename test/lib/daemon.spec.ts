import { Connection } from 'amqplib';
import { Config, Daemon, ListenersManager } from '../../lib';
import { RabbitBroker } from '../../lib/broker/rabbit/rabbit-broker';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../mock/constants';

describe('lib/daemon.ts', () => {
	beforeAll(() => {});

	afterEach(() => {
		jest.clearAllMocks();
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
		const exitSpy = jest
			.spyOn(process, 'exit')
			.mockImplementation((_code?: number) => {
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
		new Config(
			RABBIT_URL,
			RABBIT_EVENT_PEOPLE_VHOST,
			RABBIT_EVENT_PEOPLE_APP_NAME,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
		);
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
