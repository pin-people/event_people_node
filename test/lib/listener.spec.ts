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
		afterEach(() => {
			jest.clearAllMocks();
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
			// listenerClass is undefined when called without a class (plain callback usage)
			expect(consumeSpy).toBeCalledWith('some.custom.action', jestCallback, undefined);
			expect(jestCallback).toBeCalledTimes(1);
		});

		it('should not accept retry params (v1.2.0 — retry config via class attributes or Config)', () => {
			// Listener.on now has signature: on(eventName, callback, listenerClass?)
			const jestCallback = jest.fn();
			const consumeSpy = jest
				.spyOn(Config.broker, 'consume')
				.mockImplementation(() => undefined as any);

			// Calling with just 2 args still works; listenerClass defaults to undefined
			Listener.on('some.custom.action', jestCallback);

			expect(consumeSpy).toBeCalledTimes(1);
			expect(consumeSpy).toBeCalledWith('some.custom.action', jestCallback, undefined);
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
