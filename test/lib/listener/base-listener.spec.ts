import { Channel, Message } from 'amqplib';
import { setEnvs } from '../../../example/set-envs';
import { Config } from '../../../lib';

import {
	BaseListener,
	ListenerConfig,
	ListenersManager,
} from '../../../lib/listeners';

import { mockChannel, MockContext } from '../../mock/rabbit';

describe('lib/listener/base-listener.ts', () => {
	beforeAll(() => {
		setEnvs();
		new Config();
	});

	afterEach(() => {
		ListenersManager.listenerConfigurations = [];
		jest.clearAllMocks();
	});

	describe('bindEvent()', () => {
		it('- should bind 2 queues events, some.custom.action.all and some.custom.action.APP_NAME', () => {
			class CustomListener extends BaseListener {
				someMethod() {
					this.context.success();
				}
			}

			const eventName = 'some.custom.action';

			const expectedConfigs: ListenerConfig[] = [
				{
					listener: CustomListener,
					method: 'someMethod',
					eventName: `${eventName}.all`,
				},
				{
					listener: CustomListener,
					method: 'someMethod',
					eventName: `${eventName}.${Config.APP_NAME}`,
				},
			];

			const registerSpy = jest.spyOn(
				ListenersManager,
				'registerListenerConfiguration',
			);

			CustomListener.bindEvent('someMethod', eventName);

			const listenerConfigs = ListenersManager.getListenerConfigurations();

			expect(listenerConfigs.length).toBe(2);
			expect(registerSpy).toBeCalledTimes(2);
			expect(expectedConfigs).toStrictEqual(listenerConfigs);
			expectedConfigs.forEach((config: ListenerConfig, index: number) => {
				expect(registerSpy).toHaveBeenNthCalledWith(index + 1, {
					listener: config.listener,
					method: config.method,
					eventName: config.eventName,
				});
			});
		});

		it('- should just once for the queue some.custom.action.destination', () => {
			class CustomListener extends BaseListener {
				anotherMethod() {
					this.context.success();
				}
			}

			const eventName = 'some.custom.action.destination';
			const expectedEventName = eventName
				.split('.')
				.splice(0, 4)
				.concat()
				.join('.');

			const expectedConfig: ListenerConfig = {
				listener: CustomListener,
				method: 'anotherMethod',
				eventName: expectedEventName,
			};

			const registerSpy = jest.spyOn(
				ListenersManager,
				'registerListenerConfiguration',
			);

			CustomListener.bindEvent('anotherMethod', eventName);

			const listenerConfigs = ListenersManager.getListenerConfigurations();

			expect(listenerConfigs.length).toBe(1);
			expect(listenerConfigs).toStrictEqual([expectedConfig]);
			expect(registerSpy).toBeCalledTimes(1);
			expect(registerSpy).toBeCalledWith(expectedConfig);
		});
	});

	it('success() - should call context.success', () => {
		class CustomListener extends BaseListener {
			makeSuccess() {
				this.context.success();
			}
		}

		const mockContext = new MockContext(mockChannel as Channel, {} as Message);
		const contextSpy = jest.spyOn(mockContext, 'success');
		const listener = new CustomListener(mockContext);

		listener.makeSuccess();

		expect(contextSpy).toBeCalledTimes(1);
	});

	it('fail() - should call context.fail', () => {
		class CustomListener extends BaseListener {
			makeFail() {
				this.context.fail();
			}
		}

		const mockContext = new MockContext(mockChannel as Channel, {} as Message);
		const contextSpy = jest.spyOn(mockContext, 'fail');
		const listener = new CustomListener(mockContext);

		listener.makeFail();

		expect(contextSpy).toBeCalledTimes(1);
	});

	it('reject() - should call context.reject', () => {
		class CustomListener extends BaseListener {
			makeReject() {
				this.context.reject();
			}
		}

		const mockContext = new MockContext(mockChannel as Channel, {} as Message);
		const contextSpy = jest.spyOn(mockContext, 'reject');
		const listener = new CustomListener(mockContext);

		listener.makeReject();

		expect(contextSpy).toBeCalledTimes(1);
	});
});
