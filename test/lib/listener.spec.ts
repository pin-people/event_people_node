import { setEnvs } from '../../example/set-envs';
import { Config, Listener, MissingAttributeError } from '../../lib';

describe('lib/listener.ts', () => {
	describe('On()', () => {
		beforeAll(() => {
			setEnvs();
		});
		beforeAll(() => {
			new Config();
		});
		afterAll(() => {
			jest.clearAllMocks();
		});

		it('should call broker consume correctly', () => {
			const jestCallback = jest.fn();

			const consumeSpy = jest
				.spyOn(Config.broker, 'consume')
				.mockImplementation((_eventName, callback: (...args: any) => void) => {
					callback();
				});

			Listener.on('some.custom.action', jestCallback);

			expect(consumeSpy).toBeCalledTimes(1);
			expect(consumeSpy).toBeCalledWith('some.custom.action', jestCallback);
			expect(jestCallback).toBeCalledTimes(1);
		});

		it('should throw event name error', () => {
			const jestCallback = jest.fn();
			expect(() => Listener.on('', jestCallback)).toThrowError(
				new MissingAttributeError('Event name'),
			);
			expect(jestCallback).not.toBeCalled();
		});
	});

	describe('consumedEventName()', () => {
		it('should return eventname followed by ".all"', () => {
			const eventName = 'custom.event.action';
			const listener = new Listener();

			const consumed = listener['consumedEventName'](eventName);

			expect(consumed).toBe(`${eventName}.all`);
		});

		it('should return entire eventname ', () => {
			const eventName = 'custom.event.action.destination';
			const listener = new Listener();

			const consumed = listener['consumedEventName'](eventName);

			expect(consumed).toBe(eventName);
		});
	});
});
