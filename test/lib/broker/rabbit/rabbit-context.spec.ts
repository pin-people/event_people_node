import { Channel, Message } from 'amqplib';
import { RabbitContext } from '../../../../lib/broker/rabbit/rabbit-context';
import { mockChannel } from '../../../mock/rabbit';
import { setEnvs } from '../../../../example/set-envs';
import { Config } from '../../../../lib';

describe('broker/rabbit/rabbit-context', () => {
	const body = { text: 'will fail' };
	const bufferFromBody = Buffer.from(JSON.stringify(body));
	const message: Message = {
		content: bufferFromBody,
		properties: { headers: {} },
	} as unknown as Message;

	beforeAll(() => {
		setEnvs();
		new Config();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const makeContext = (maxRetries = 3, retryCount = 0, delayStrategy = 'exponential', initialDelay = 1000) =>
		new RabbitContext(
			mockChannel as Channel,
			message,
			'test-queue',
			maxRetries,
			initialDelay,
			delayStrategy,
			retryCount,
			`${process.env.RABBIT_EVENT_PEOPLE_APP_NAME}_dlq`,
		);

	it('success() - Should call channel ack correctly', () => {
		const context = makeContext();

		context.success();

		expect(mockChannel.ack).toBeCalledTimes(1);
		expect(mockChannel.ack).toBeCalledWith(message, false);
	});

	it('fail() - retries remain: should publish to retry queue and ack', () => {
		const context = makeContext(3, 0);
		const publishSpy = jest
			.spyOn(mockChannel, 'publish')
			.mockReturnValueOnce(true);

		context.fail();

		expect(publishSpy).toBeCalledTimes(1);
		expect(mockChannel.ack).toBeCalledTimes(1);
		expect(mockChannel.nack).not.toBeCalled();
	});

	it('fail() - retries exhausted: should nack without requeue (to DLQ)', () => {
		const context = makeContext(3, 3);

		context.fail();

		expect(mockChannel.nack).toBeCalledTimes(1);
		expect(mockChannel.nack).toBeCalledWith(message, false, false);
		expect(mockChannel.publish).not.toBeCalled();
	});

	it('fail() - publish fails: should nack without requeue (nack to DLQ, no infinite loop)', () => {
		const context = makeContext(3, 0);
		jest.spyOn(mockChannel, 'publish').mockImplementationOnce(() => {
			throw new Error('broker unavailable');
		});

		context.fail();

		expect(mockChannel.nack).toBeCalledTimes(1);
		expect(mockChannel.nack).toBeCalledWith(message, false, false);
	});

	it('isLastRetry - should be true when retryCount >= maxRetries - 1', () => {
		const context = makeContext(3, 2);
		expect(context.isLastRetry).toBe(true);
	});

	it('isLastRetry - should be false when retryCount < maxRetries - 1', () => {
		const context = makeContext(3, 0);
		expect(context.isLastRetry).toBe(false);
	});

	it('reject() - Should nack without requeue (routes to DLQ via DLX)', () => {
		const context = makeContext();

		context.reject();

		expect(mockChannel.nack).toBeCalledTimes(1);
		expect(mockChannel.nack).toBeCalledWith(message, false, false);
	});
});
