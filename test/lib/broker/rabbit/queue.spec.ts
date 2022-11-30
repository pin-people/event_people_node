import { Channel, Message } from 'amqplib';
import { Config, Context, Event } from '../../../../lib';
import { Queue } from '../../../../lib/broker/rabbit/queue';
import { Topic } from '../../../../lib/broker/rabbit/topic';
import { DeliveryInfo } from '../../../../lib/listeners';
import { mockChannel, mockSuccessCallback } from '../../../mock/rabbit';
import { setEnvs } from '../../../../example/set-envs';

describe('broker/rabbit/queue.ts', () => {
	let routingKey: string, queueName: string;
	let makeAssertQueueSpy: (queueName: string) => any;

	beforeAll(() => {
		setEnvs();
		new Config();
		routingKey = 'message.origin.custom.all';
		queueName = `${process.env.RABBIT_EVENT_PEOPLE_APP_NAME}-${routingKey}`;
		makeAssertQueueSpy = (queueName: string) =>
			jest.spyOn(mockChannel, 'assertQueue').mockResolvedValueOnce({
				queue: queueName,
				messageCount: 0,
				consumerCount: 1,
			});
	});
	afterAll(() => {
		jest.clearAllMocks();
	});

	it('subscribe() - Should call subscribe with the correct event and callback', async () => {
		const queueOptions = { durable: true, exclusive: false };

		const topic = new Topic(
			mockChannel as Channel,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
		);

		const assertedQueueSpy = makeAssertQueueSpy(queueName);
		const prefetchSpy = jest.spyOn(mockChannel, 'prefetch');
		const bindQueueSpy = jest.spyOn(mockChannel, 'bindQueue');
		const consumeSpy = jest.spyOn(mockChannel, 'consume');

		const queue = new Queue(mockChannel as Channel, topic);
		await queue.subscribe(routingKey, mockSuccessCallback);

		expect(assertedQueueSpy).toBeCalledTimes(1);
		expect(assertedQueueSpy).toBeCalledWith(queueName, queueOptions);
		expect(prefetchSpy).toBeCalledTimes(1);
		expect(prefetchSpy).toBeCalledWith(1);
		expect(bindQueueSpy).toBeCalledTimes(1);
		expect(bindQueueSpy).toHaveBeenCalledWith(
			queueName,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
			routingKey,
		);
		expect(consumeSpy).toBeCalledTimes(1);
		expect(consumeSpy).toHaveBeenCalledWith(queueName, expect.any(Function));
	});

	it('callback() - should run consume, and callback correctly, then call the trigger method', async () => {
		const topic = new Topic(
			mockChannel as Channel,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
		);
		const rabbitQueue = new Queue(mockChannel as Channel, topic);
		makeAssertQueueSpy(queueName);

		const deliveryInfo: DeliveryInfo = {
			deliveryTag: '1.0.0',
			routingKey: routingKey,
		};
		const payload: Record<string, any> = { text: 'hi' };
		const message: Partial<Message> = {
			content: Buffer.from(JSON.stringify(payload)),
		};

		const consumeSpy = jest
			.spyOn(mockChannel, 'consume')
			.mockImplementation(
				() =>
					rabbitQueue['callback'](
						deliveryInfo,
						payload,
						message as Message,
						triggerMethod,
					) as any,
			);

		const triggerMethod = jest
			.fn()
			.mockImplementation((event: Event, context: Context) => {
				console.log(
					'Trigger Method Messsage received for => ',
					event.getName(),
				);
				context.reject();
			});

		await rabbitQueue.subscribe(routingKey, triggerMethod);

		expect(consumeSpy).toBeCalled();
		expect(triggerMethod).toBeCalled();
	});
});
