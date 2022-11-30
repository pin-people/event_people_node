import amqp, { Connection } from 'amqplib';
import { Config, Event } from '../../../../lib';
jest.mock('../../../../lib/broker/rabbit/queue');
import { Queue } from '../../../../lib/broker/rabbit/queue';
import { RabbitBroker } from '../../../../lib/broker/rabbit/rabbit-broker';
import { Topic } from '../../../../lib/broker/rabbit/topic';
import { mockConnection, mockSuccessCallback } from '../../../mock/rabbit';
import { setEnvs } from '../../../../example/set-envs';

describe('broker/rabbit/rabbit-broker.ts', () => {
	let broker: RabbitBroker;

	beforeAll(() => {
		setEnvs();
		broker = new RabbitBroker();
		new Config(broker);
	});
	afterAll(async () => {
		await broker.closeConnection();
		jest.clearAllMocks();
	});

	it('getConnection() - Should return the connection on', async () => {
		const connectSpy = jest
			.spyOn(amqp, 'connect')
			.mockResolvedValueOnce(mockConnection as Connection);

		await broker.getConnection();
		await broker.closeConnection();

		expect(broker).toBeDefined();
		expect(connectSpy).toBeCalledWith(Config.FULL_URL);
		expect(mockConnection.close).toBeCalled();
	});

	it('getChannel() - Should return the broker channel', async () => {
		await broker.getConnection();
		expect(mockConnection.createChannel).toBeCalledTimes(1);
	});

	it('consume() - should call queue.subscribe correctly', async () => {
		const eventName = 'resource.origin.action';

		const queueSpySubscribe = jest
			.spyOn(Queue.prototype, 'subscribe')
			.mockResolvedValueOnce(
				new Promise<void>(() => {
					return;
				}),
			);

		await broker.consume(eventName, mockSuccessCallback);
		expect(queueSpySubscribe).toBeCalledTimes(1);
		expect(queueSpySubscribe).toBeCalledWith(eventName, mockSuccessCallback);
	});

	it('produce() - Should call topic.produce correctly', async () => {
		const eventName = 'resource.origin.action2';
		const body: Record<string, any> = { text: 'hello friend' };
		const event = new Event(eventName, body);

		const topicSpyProduce = jest.spyOn(Topic.prototype, 'produce');

		await broker.produce(event);

		expect(topicSpyProduce).toBeCalled();
	});

	it('closeConnection()', async () => {
		const closeSpy = jest.spyOn(mockConnection, 'close');
		await broker.closeConnection();
		expect(closeSpy).toBeCalled();
	});
});
