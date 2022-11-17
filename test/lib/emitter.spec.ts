import { Config, Emitter, Event, MissingAttributeError } from '../../lib';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../mock/constants';

describe('lib/emitter.ts', () => {
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

	describe('trigger()', () => {
		it('trigger() - Should call broker produce for each event', () => {
			const events: Event[] = [
				new Event('custom.event.action1', { msg: 'test message1' }),
				new Event('custom.event.action2', { msg: 'test message2' }),
				new Event('custom.event.action3', { msg: 'test message3' }),
			];
			const produceSpy = jest
				.spyOn(Config.broker, 'produce')
				.mockImplementation(() => {
					return;
				});

			Emitter.trigger(...events);

			expect(produceSpy).toBeCalledTimes(3);
			events.forEach((event: Event, index: number) => {
				expect(produceSpy).toHaveBeenNthCalledWith(index + 1, event);
			});
		});

		it('trigger() - Should throw Event body error', () => {
			const event = {
				getBody: jest.fn().mockReturnValue(null),
				getName: jest.fn().mockReturnValue('event.some.name'),
			} as unknown as Event;

			expect(() => Emitter.trigger(event)).toThrow(
				new MissingAttributeError(`Event body on position 0`),
			);
		});

		it('trigger() - Should throw Event name error', () => {
			const event = {
				getBody: jest.fn().mockReturnValue({
					msg: 'body msg',
				}),
				getName: jest.fn().mockReturnValue(null),
			} as unknown as Event;

			expect(() => Emitter.trigger(event)).toThrow(
				new MissingAttributeError(`Event name on position 0`),
			);
		});
	});
});
