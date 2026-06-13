import { Channel, Connection, Message } from 'amqplib';
import { Config, Context, Event } from '../../../../lib';
import { Queue } from '../../../../lib/broker/rabbit/queue';
import { Topic } from '../../../../lib/broker/rabbit/topic';
import { BaseListener, DeliveryInfo } from '../../../../lib/listeners';
import {
	mockChannel,
	mockConnection,
	mockSuccessCallback,
} from '../../../mock/rabbit';
import { setEnvs } from '../../../../example/set-envs';

describe('broker/rabbit/queue.ts', () => {
	let routingKey: string, queueName: string, dlqName: string, dlxName: string, retryQueueName: string;

	beforeAll(async () => {
		setEnvs();
		new Config();
		routingKey = 'message.origin.custom.all';
		const appName = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
		queueName = `${appName}-${routingKey}`;
		dlqName = `${appName}_dlq`;
		dlxName = `${appName}_dlx`;
		retryQueueName = `${queueName}_retry`;

		jest
			.spyOn(Config.broker, 'getConnection')
			.mockImplementationOnce(() =>
				Promise.resolve(mockConnection as Connection),
			);

		await Config.init();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		// Default mock for assertQueue returns the queue name
		(mockChannel.assertQueue as jest.Mock).mockImplementation((name: string) =>
			Promise.resolve({ queue: name, messageCount: 0, consumerCount: 1 }),
		);
		(mockChannel.assertExchange as jest.Mock).mockResolvedValue(undefined);
		(mockChannel.bindQueue as jest.Mock).mockResolvedValue(undefined);
		(mockChannel.prefetch as jest.Mock).mockResolvedValue(undefined);
		(mockChannel.consume as jest.Mock).mockResolvedValue(undefined);
	});

	it('subscribe() - Should declare full DLX/DLQ/retry topology, bind and consume', async () => {
		const topic = new Topic(
			mockChannel as Channel,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
		);

		const assertExchangeSpy = jest.spyOn(mockChannel, 'assertExchange');
		const assertQueueSpy = jest.spyOn(mockChannel, 'assertQueue');
		const bindQueueSpy = jest.spyOn(mockChannel, 'bindQueue');
		const prefetchSpy = jest.spyOn(mockChannel, 'prefetch');
		const consumeSpy = jest.spyOn(mockChannel, 'consume');

		const queue = new Queue(mockChannel as Channel, topic);
		await queue.subscribe(routingKey, mockSuccessCallback);

		// DLX exchange declared
		expect(assertExchangeSpy).toBeCalledWith(dlxName, 'fanout', { durable: true });

		// DLQ declared and bound to DLX
		expect(assertQueueSpy).toBeCalledWith(dlqName, { durable: true });
		expect(bindQueueSpy).toBeCalledWith(dlqName, dlxName, '');

		// Retry queue declared (no queue-level TTL)
		expect(assertQueueSpy).toBeCalledWith(retryQueueName, {
			durable: true,
			arguments: {
				'x-dead-letter-exchange': '',
				'x-dead-letter-routing-key': queueName,
			},
		});

		// Main queue declared with DLX
		expect(assertQueueSpy).toBeCalledWith(queueName, {
			exclusive: false,
			durable: true,
			arguments: { 'x-dead-letter-exchange': dlxName },
		});

		expect(prefetchSpy).toBeCalledTimes(1);
		expect(prefetchSpy).toBeCalledWith(1);

		// Main queue bound to topic exchange with routing key
		expect(bindQueueSpy).toBeCalledWith(
			queueName,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
			routingKey,
		);

		expect(consumeSpy).toBeCalledTimes(1);
		expect(consumeSpy).toBeCalledWith(queueName, expect.any(Function));
	});

	it('callback() - should build Event + Context and call trigger method', async () => {
		const topic = new Topic(
			mockChannel as Channel,
			String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
		);
		const rabbitQueue = new Queue(mockChannel as Channel, topic);

		const deliveryInfo: DeliveryInfo = {
			deliveryTag: '1.0.0',
			routingKey: routingKey,
		};
		const payload: Record<string, any> = { text: 'hi' };
		const message: Partial<Message> = {
			content: Buffer.from(JSON.stringify(payload)),
			properties: { headers: {} } as any,
		};

		const triggerMethod = jest
			.fn()
			.mockImplementation((event: Event, context: Context) => {
				console.log(
					'Trigger Method Message received for => ',
					event.getName(),
				);
				context.reject();
			});

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

		await rabbitQueue.subscribe(routingKey, triggerMethod);

		expect(consumeSpy).toBeCalled();
		expect(triggerMethod).toBeCalled();
	});

	describe('per-listener retry config override', () => {
		let topic: Topic;
		let rabbitQueue: Queue;
		const payload: Record<string, any> = { text: 'fail me' };

		beforeEach(() => {
			topic = new Topic(
				mockChannel as Channel,
				String(process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME),
			);
			rabbitQueue = new Queue(mockChannel as Channel, topic);
			jest.clearAllMocks();
		});

		it('should use listener static maxAttempts (1) instead of Config default (3) — nack after 1 attempt', () => {
			// A listener subclass with maxAttempts = 1
			class StrictListener extends BaseListener {
				static maxAttempts = 1;
			}

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: '1',
				routingKey,
			};
			// retryCount = 0 (first attempt). With maxAttempts=1, shouldRetry(0) = false → nack to DLQ
			const message: Partial<Message> = {
				content: Buffer.from(JSON.stringify(payload)),
				properties: { headers: { 'x-event-people-retries': 0 } } as any,
			};

			let capturedContext: Context | undefined;
			const triggerMethod = jest.fn().mockImplementation((_event: Event, context: Context) => {
				capturedContext = context;
				context.fail();
			});

			rabbitQueue['callback'](
				deliveryInfo,
				payload,
				message as Message,
				triggerMethod,
				StrictListener,
			);

			// With maxAttempts=1 and retryCount=0: shouldRetry(0) = 0 < 1 = true
			// Wait — retryCount(0) < maxAttempts(1) means retry IS allowed on attempt 0.
			// On attempt 1 (retryCount=1): 1 < 1 = false → nack.
			// So the context.maxRetries should be 1 (not the Config default 3).
			expect(capturedContext).toBeDefined();
			expect(capturedContext!.maxRetries).toBe(1);
			// retryCount=0 < maxAttempts=1 → should publish to retry queue (not nack yet)
			expect(mockChannel.publish).toBeCalledTimes(1);
			expect(mockChannel.nack).not.toBeCalled();
		});

		it('should nack after exhausting per-listener maxAttempts=1 (retryCount already at 1)', () => {
			class StrictListener extends BaseListener {
				static maxAttempts = 1;
			}

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: '2',
				routingKey,
			};
			// retryCount = 1: with maxAttempts=1, shouldRetry(1) = 1 < 1 = false → nack
			const message: Partial<Message> = {
				content: Buffer.from(JSON.stringify(payload)),
				properties: { headers: { 'x-event-people-retries': 1 } } as any,
			};

			const triggerMethod = jest.fn().mockImplementation((_event: Event, context: Context) => {
				context.fail();
			});

			// Mock publish to succeed so it doesn't affect nack logic
			(mockChannel.publish as jest.Mock).mockReturnValue(true);

			rabbitQueue['callback'](
				deliveryInfo,
				payload,
				message as Message,
				triggerMethod,
				StrictListener,
			);

			// retryCount=1 >= maxAttempts=1 → nack to DLQ (not publish to retry)
			expect(mockChannel.nack).toBeCalledTimes(1);
			expect(mockChannel.nack).toBeCalledWith(expect.anything(), false, false);
			expect(mockChannel.publish).not.toBeCalled();
		});

		it('should use Config default maxAttempts=3 when listener has no static maxAttempts', () => {
			class DefaultListener extends BaseListener {}

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: '3',
				routingKey,
			};
			const message: Partial<Message> = {
				content: Buffer.from(JSON.stringify(payload)),
				properties: { headers: { 'x-event-people-retries': 0 } } as any,
			};

			let capturedContext: Context | undefined;
			const triggerMethod = jest.fn().mockImplementation((_event: Event, context: Context) => {
				capturedContext = context;
			});

			rabbitQueue['callback'](
				deliveryInfo,
				payload,
				message as Message,
				triggerMethod,
				DefaultListener,
			);

			expect(capturedContext!.maxRetries).toBe(Config.maxAttempts);
		});

		it('should use listener static initialDelay and delayStrategy over Config defaults', () => {
			class SpecialListener extends BaseListener {
				static maxAttempts = 5;
				static initialDelay = 500;
				static delayStrategy = 'fixed';
				static dlqName = 'special_dlq';
			}

			const deliveryInfo: DeliveryInfo = {
				deliveryTag: '4',
				routingKey,
			};
			const message: Partial<Message> = {
				content: Buffer.from(JSON.stringify(payload)),
				properties: { headers: { 'x-event-people-retries': 0 } } as any,
			};

			let capturedContext: Context | undefined;
			const triggerMethod = jest.fn().mockImplementation((_event: Event, context: Context) => {
				capturedContext = context;
			});

			rabbitQueue['callback'](
				deliveryInfo,
				payload,
				message as Message,
				triggerMethod,
				SpecialListener,
			);

			// maxRetries should be the listener's 5, not Config's 3
			expect(capturedContext!.maxRetries).toBe(5);
			// dlqName should be the listener's
			expect(capturedContext!.dlqName).toBe('special_dlq');
		});

		it('subscribe() passes listenerClass to callback so per-listener config is applied end-to-end', async () => {
			class OneRetryListener extends BaseListener {
				static maxAttempts = 1;
			}

			let capturedContext: Context | undefined;
			const triggerMethod = jest.fn().mockImplementation((_event: Event, context: Context) => {
				capturedContext = context;
			});

			// Capture the consume handler when subscribe is called
			let consumeHandler: ((msg: any) => void) | undefined;
			(mockChannel.consume as jest.Mock).mockImplementation((_queue: string, handler: (msg: any) => void) => {
				consumeHandler = handler;
				return Promise.resolve(undefined);
			});

			await rabbitQueue.subscribe(routingKey, triggerMethod, OneRetryListener);

			// Simulate delivery of a message
			const rawMessage = {
				content: Buffer.from(JSON.stringify({ text: 'hello' })),
				fields: { deliveryTag: 1, routingKey },
				properties: { headers: { 'x-event-people-retries': 0 } },
			};
			consumeHandler!(rawMessage);

			expect(triggerMethod).toBeCalledTimes(1);
			// The context should reflect OneRetryListener.maxAttempts = 1, not Config default 3
			expect(capturedContext!.maxRetries).toBe(1);
		});
	});
});
