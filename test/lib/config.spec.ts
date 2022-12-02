import { Config } from '../../lib';
import { Connection } from 'amqplib';
import { setEnvs } from '../../example/set-envs';

describe('lib/config.ts', () => {
	beforeAll(() => {
		setEnvs();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	it('init() - should return broker connection', async () => {
		const mockConnection: Partial<Connection> = {
			createChannel: jest.fn(),
			close: jest.fn(),
		};

		new Config();

		const getConnectionSpy = jest
			.spyOn(Config.broker, 'getConnection')
			.mockImplementation(() => {
				return new Promise<Connection>((resolve) =>
					resolve(mockConnection as Connection),
				);
			});

		await Config.init();

		expect(getConnectionSpy).toBeCalledTimes(1);
		expect(Config.broker.getConnection()).resolves.toStrictEqual(
			mockConnection,
		);
	});

	it('getBroker() - Should return correct broker', () => {
		new Config();

		const broker = Config.getBroker();

		expect(broker).toBeDefined();
	});
});
