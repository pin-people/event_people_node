import { Channel, Message } from 'amqplib';
import { Config } from '../../../lib';
import {
	BaseListener,
	ListenerConfig,
	ListenersManager,
} from '../../../lib/listeners';
import {
	RABBIT_EVENT_PEOPLE_APP_NAME,
	RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	RABBIT_EVENT_PEOPLE_VHOST,
	RABBIT_URL,
} from '../../mock/constants';
import { mockChannel, MockContext } from '../../mock/rabbit';

describe('lib/listener/base-listener.ts', () => {
	new Config(
		RABBIT_URL,
		RABBIT_EVENT_PEOPLE_VHOST,
		RABBIT_EVENT_PEOPLE_APP_NAME,
		RABBIT_EVENT_PEOPLE_TOPIC_NAME,
	);

	afterEach(() => {
		ListenersManager.listenerConfigurations = [];
		jest.clearAllMocks();
	});

	describe('bindEvent()', () => {
		it('bindEvent() - should bind 2 queues events, some.custom.action.all and some.custom.action.APP_NAME', () => {
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
					routingKey: `${eventName}.all`,
				},
				{
					listener: CustomListener,
					method: 'someMethod',
					routingKey: `${eventName}.${Config.APP_NAME}`,
				},
			];

			const registerSpy = jest.spyOn(
				ListenersManager,
				'registerListenerConfiguration',
			);

			CustomListener.bindEvent('someMethod', eventName);

			const listenerConfigs = ListenersManager.getListenerConfigurations();
			expect(listenerConfigs.length).toBe(2);
			expect(listenerConfigs).toStrictEqual(expectedConfigs);
			expect(registerSpy).toBeCalledTimes(2);
			expectedConfigs.forEach((config: ListenerConfig, index: number) => {
				expect(registerSpy).toHaveBeenNthCalledWith(index + 1, {
					listener: config.listener,
					method: config.method,
					routingKey: config.routingKey,
				});
			});
		});

		it('bindEvent() - should just once for the queue some.custom.action.destination', () => {
			class CustomListener extends BaseListener {
				anotherMethod() {
					this.context.success();
				}
			}

			const eventName = 'some.custom.action.destination';
			const expectedEventName = eventName
				.split('.')
				.splice(0, 3)
				.concat(Config.APP_NAME)
				.join('.');

			const expectedConfig: ListenerConfig = {
				listener: CustomListener,
				method: 'anotherMethod',
				routingKey: expectedEventName,
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
			someMethod() {}
		}

		CustomListener.bindEvent('someMethod', 'some.custom.action');
	});
});
