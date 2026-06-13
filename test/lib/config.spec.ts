import { Config } from '../../lib';
import { Connection } from 'amqplib';
import { setEnvs } from '../../example/set-envs';

describe('lib/config.ts', () => {
	beforeAll(() => {
		setEnvs();
	});
	afterEach(() => {
		jest.clearAllMocks();
		// Reset Config retry defaults back to hardcoded defaults after each test
		Config.maxAttempts = 3;
		Config.initialDelay = 1000;
		Config.delayStrategy = 'exponential';
		Config.dlqName = undefined;
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

	describe('configure()', () => {
		it('should set maxAttempts when provided', () => {
			Config.configure({ maxAttempts: 5 });
			expect(Config.maxAttempts).toBe(5);
		});

		it('should set initialDelay when provided', () => {
			Config.configure({ initialDelay: 2000 });
			expect(Config.initialDelay).toBe(2000);
		});

		it('should set delayStrategy when provided', () => {
			Config.configure({ delayStrategy: 'fixed' });
			expect(Config.delayStrategy).toBe('fixed');
		});

		it('should set dlqName when provided', () => {
			Config.configure({ dlqName: 'my_custom_dlq' });
			expect(Config.dlqName).toBe('my_custom_dlq');
		});

		it('should set multiple options at once', () => {
			Config.configure({ maxAttempts: 7, initialDelay: 500, delayStrategy: 'fixed', dlqName: 'my_dlq' });
			expect(Config.maxAttempts).toBe(7);
			expect(Config.initialDelay).toBe(500);
			expect(Config.delayStrategy).toBe('fixed');
			expect(Config.dlqName).toBe('my_dlq');
		});

		it('should not override unspecified options', () => {
			Config.maxAttempts = 3;
			Config.initialDelay = 1000;
			Config.configure({ maxAttempts: 10 });
			expect(Config.maxAttempts).toBe(10);
			expect(Config.initialDelay).toBe(1000); // unchanged
		});
	});

	describe('getRetryConfig()', () => {
		it('should return all retry config fields including initialDelay', () => {
			Config.maxAttempts = 3;
			Config.initialDelay = 1000;
			Config.delayStrategy = 'exponential';
			Config.dlqName = 'test_dlq';

			const config = Config.getRetryConfig();

			expect(config).toEqual({
				maxAttempts: 3,
				initialDelay: 1000,
				delayStrategy: 'exponential',
				dlqName: 'test_dlq',
			});
		});

		it('should reflect values set via configure()', () => {
			Config.configure({ maxAttempts: 5, initialDelay: 2500, delayStrategy: 'fixed', dlqName: 'custom_dlq' });

			const config = Config.getRetryConfig();

			expect(config.maxAttempts).toBe(5);
			expect(config.initialDelay).toBe(2500);
			expect(config.delayStrategy).toBe('fixed');
			expect(config.dlqName).toBe('custom_dlq');
		});
	});
});
