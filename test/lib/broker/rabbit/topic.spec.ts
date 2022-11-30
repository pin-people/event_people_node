import { Channel } from 'amqplib';
import { Config, Event } from '../../../../lib';
import { Topic } from '../../../../lib/broker/rabbit/topic';
import { MissingAttributeError } from '../../../../lib/utils/errors';
import { mockChannel } from '../../../mock/rabbit';
import { setEnvs } from '../../../../example/set-envs';

describe('broker/rabbit/topic', () => {
	beforeAll(() => {
		setEnvs();
		new Config();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('getTopic() - Should return topic name', () => {
		const topic = new Topic(mockChannel as Channel, Config.TOPIC_NAME);

		const topicName = topic.getTopic();

		expect(topicName).toBe(Config.TOPIC_NAME);
	});

	it('getChannel() - Should return topic channel', () => {
		const topic = new Topic(mockChannel as Channel, Config.TOPIC_NAME);
		const channel = topic.getChannel();

		expect(channel).toStrictEqual(mockChannel);
	});

	describe('produce()', () => {
		it('produce() - Should throw MissingAttributeError Error due to no topic provided', async () => {
			const topic = new Topic(mockChannel as Channel, '');

			const event = new Event('some.event.do', { text: 'event message' });
			await expect(() => topic.produce(event)).rejects.toThrowError(
				new MissingAttributeError('topic'),
			);
		});

		it('produce() - Should publish a message correctly to its channel', async () => {
			const topic = new Topic(mockChannel as Channel, Config.TOPIC_NAME);

			const eventName = 'some.event.do';
			const body = { text: 'event message' };
			const event = new Event(eventName, body);
			const contentBuffer = Buffer.from(JSON.stringify(event.payload()));
			const options = {
				contentType: 'application/json',
				type: 'topic',
			};

			await topic.produce(event);

			expect(mockChannel.publish).toBeCalledTimes(1);

			expect(mockChannel.publish).toBeCalledWith(
				Config.TOPIC_NAME,
				eventName,
				contentBuffer,
				options,
			);
		});
	});
});
