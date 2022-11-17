import { Channel, Message } from 'amqplib';
import {
	BaseListener,
	Context,
	Event,
	Listener,
	ListenerConfig,
	ListenersManager,
} from '../../../lib';
import { mockChannel, MockContext } from '../../mock/rabbit';

describe('lib/listener/listeners-manager.ts', () => {
	let mockContext: MockContext;

	beforeAll(() => {
		mockContext = new MockContext(mockChannel as Channel, {} as Message);
	});

	afterEach(() => {
		ListenersManager.listenerConfigurations = [];
		jest.clearAllMocks();
	});

	it('bindAllListeners() - should call listeners method for each listener config', () => {
		const routingKey = 'some.custom.action.destination';

		class CustomListener1 extends BaseListener {
			constructor() {
				super(mockContext);
			}
			makeSuccess() {
				this.success();
			}
		}

		class CustomListener2 extends BaseListener {
			constructor() {
				super(mockContext);
			}
			makeAnotherSuccess() {
				this.success();
			}
		}

		const makeSuccessSpy = jest.spyOn(CustomListener1.prototype, 'makeSuccess');
		const makeAnotherSuccessSpy = jest.spyOn(
			CustomListener2.prototype,
			'makeAnotherSuccess',
		);

		ListenersManager.listenerConfigurations = [
			{
				listener: CustomListener1,
				method: 'makeSuccess',
				routingKey: routingKey,
			},
			{
				listener: CustomListener2,
				method: 'makeAnotherSuccess',
				routingKey: routingKey,
			},
		];

		const fakeConsume = jest
			.fn()
			.mockImplementation((_eventName: string, callback: Function) => {
				callback();
			});

		const listenerSpy = jest
			.spyOn(Listener, 'on')
			.mockImplementation(
				(
					eventName: string,
					callback: (event: Event, context: Context) => void,
				) => {
					fakeConsume(eventName, callback);
				},
			);

		ListenersManager.bindAllListeners();

		expect(listenerSpy).toBeCalledTimes(2);
		expect(fakeConsume).toBeCalledTimes(2);
		expect(makeSuccessSpy).toBeCalledTimes(1);
		expect(makeAnotherSuccessSpy).toBeCalledTimes(1);
	});

	it('registerListenerConfiguration() - it should add new configs to listenerConfigurations', () => {
		const config: ListenerConfig = {
			listener: BaseListener,
			method: 'success',
			routingKey: 'some.new.routing',
		};

		ListenersManager.registerListenerConfiguration(config);

		expect(ListenersManager.listenerConfigurations).toStrictEqual([config]);
	});

	it('getListenerConfigurations() - it should return listener configs', () => {
		const config: ListenerConfig = {
			listener: BaseListener,
			method: 'success',
			routingKey: 'some.new.routing',
		};

		ListenersManager.listenerConfigurations = [config];

		const configs = ListenersManager.getListenerConfigurations();

		expect(configs).toStrictEqual([config]);
	});
});
