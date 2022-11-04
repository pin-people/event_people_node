import { Channel, Message } from 'amqplib';
import { RabbitContext } from '../../../../lib/broker/rabbit/rabbit-context';
import { mockChannel } from '../../../mock/rabbit';

describe('broker/rabbit/rabbit-context', () => {
	const body = { text: 'will fail' };
	const bufferFromBody = Buffer.from(JSON.stringify(body));
	const message: Message = { content: bufferFromBody } as Message;

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('success() - Should call channel ack correctly', () => {
		const context = new RabbitContext(mockChannel as Channel, message);

		context.success();

		expect(mockChannel.ack).toBeCalledTimes(1);
		expect(mockChannel.ack).toBeCalledWith(message, false);
	});

	it('fail() - Should call channel nack correctly', () => {
		const context = new RabbitContext(mockChannel as Channel, message);

		context.fail();

		expect(mockChannel.nack).toBeCalledTimes(1);
		expect(mockChannel.nack).toBeCalledWith(message, false, true);
	});

	it('reject() - Should call channel reject correctly', () => {
		const context = new RabbitContext(mockChannel as Channel, message);

		context.reject();

		expect(mockChannel.reject).toBeCalledTimes(1);
		expect(mockChannel.reject).toBeCalledWith(message, false);
	});
});
