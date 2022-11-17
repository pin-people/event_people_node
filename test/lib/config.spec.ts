import { Config } from '../../lib';
import { Connection } from 'amqplib';

import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../mock/constants';

describe('lib/config.ts', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	it('init() - should return broker connection', async () => {
		const mockConnection: Partial<Connection> = {
			createChannel: jest.fn(),
			close: jest.fn(),
		};

		new Config(
			RABBIT_URL,
			RABBIT_EVENT_PEOPLE_VHOST,
			RABBIT_EVENT_PEOPLE_APP_NAME,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
		);

		const getConnectionSpy = jest
			.spyOn(Config.broker, 'getConnection')
			.mockImplementation(() => {
				return new Promise<Connection>((resolve) =>
					resolve(mockConnection as Connection),
				);
			});

		Config.init();

		expect(getConnectionSpy).toBeCalledTimes(1);
		expect(Config.broker.getConnection()).resolves.toStrictEqual(
			mockConnection,
		);
	});

	it('getBroker() - Should return correct broker', () => {
		new Config(
			RABBIT_URL,
			RABBIT_EVENT_PEOPLE_VHOST,
			RABBIT_EVENT_PEOPLE_APP_NAME,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
		);

		const broker = Config.getBroker();

		expect(broker).toBeDefined();
	});
});
