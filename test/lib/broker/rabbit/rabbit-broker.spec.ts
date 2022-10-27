import amqp, { Channel, Connection } from 'amqplib';
import { Config } from '../../../../lib';
import { RabbitBroker } from '../../../../lib/broker/rabbit/rabbit-broker';

describe('broker/rabbit/rabbit-broker.ts', () => {
	afterAll(() => {
		jest.clearAllMocks();
	});

	let mockChannel: Partial<Channel>;
	let mockConnection: Partial<Connection>;

	beforeAll(() => {
		mockChannel = {
			assertQueue: jest.fn(),
			publish: jest.fn(),
			consume: jest.fn(),
			ack: jest.fn(),
			nack: jest.fn(),
			reject: jest.fn(),
		};

		mockConnection = {
			createChannel: jest.fn().mockRejectedValueOnce(mockChannel),
			close: jest.fn(),
		};
	});

	it('Should  connect', async () => {
		new Config();
		const broker = new RabbitBroker();
		expect(broker).toBeDefined();
		await broker.getConnection();
		await broker.closeConnection();
	});
});
