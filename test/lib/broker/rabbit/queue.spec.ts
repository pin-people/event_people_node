import { MissingAttributeError } from '../../../../lib/utils/errors';
import { Channel, Message } from 'amqplib';
import { Config, Context, Event } from '../../../../lib';
import { Queue } from '../../../../lib/broker/rabbit/queue';
import { Topic } from '../../../../lib/broker/rabbit/topic';
import { DeliveryInfo } from '../../../../lib/listeners';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../../../mock/constants';
import { mockChannel, mockSuccessCallback } from '../../../mock/rabbit';

describe('broker/rabbit/queue.ts', () => {
	const routingKey = 'message.origin.custom.all';
	const queueName = `${RABBIT_EVENT_PEOPLE_APP_NAME}-${routingKey}`;
	const makeAssertQueueSpy = (queueName: string) =>
		jest.spyOn(mockChannel, 'assertQueue').mockResolvedValueOnce({
			queue: queueName,
			messageCount: 0,
			consumerCount: 1,
		});

	beforeAll(() => {
		new Config(
			RABBIT_URL,
			RABBIT_EVENT_PEOPLE_VHOST,
			RABBIT_EVENT_PEOPLE_APP_NAME,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
		);
	});
	afterAll(() => {
		jest.clearAllMocks();
	});

	it('subscribe() - Should call subscribe with the correct event and callback', async () => {
		const queueOptions = { durable: true, exclusive: false };

		const topic = new Topic(
			mockChannel as Channel,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
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
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
			routingKey,
		);
		expect(consumeSpy).toBeCalledTimes(1);
		expect(consumeSpy).toHaveBeenCalledWith(queueName, expect.any(Function));
	});

	it('callback() - should run consume, and callback correctly, then call the trigger method', async () => {
		const topic = new Topic(
			mockChannel as Channel,
			RABBIT_EVENT_PEOPLE_TOPIC_NAME,
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

	describe('queueName', () => {
		let queue: Queue;
		beforeAll(() => {
			const topic = new Topic(
				mockChannel as Channel,
				RABBIT_EVENT_PEOPLE_TOPIC_NAME,
			);
			queue = new Queue(mockChannel as Channel, topic);
		});

		it('queueName() - should throw error due to incorrect routingKey pattern', () => {
			const routingKey = 'resource.custom';
			try {
				queue['queueName'](routingKey);
			} catch (error) {
				expect(error).toBeInstanceOf(MissingAttributeError);
			}
		});

		it('queueName() - should mount queue name correctly with "all" suffix', () => {
			const routingKey = 'resource.custom.pay';
			const queueName = `${Config.APP_NAME}-${routingKey}`;

			const queueNameResult = queue['queueName'](routingKey);
			expect(queueNameResult).toBe(queueName + '.all');
		});
	});
});
