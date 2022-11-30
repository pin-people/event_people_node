import { Event, Context } from '../../../lib';
import { BaseBroker, Connection } from '../../../lib/broker';

describe('broker/base-broker.ts', () => {
	afterAll(() => {
		jest.clearAllMocks();
	});

	class mockContext implements Context {
		success(): void {
			return;
		}
		fail(): void {
			return;
		}
		reject(): void {
			return;
		}
	}

	class Broker implements BaseBroker {
		consumers: any[];
		connection: Connection;

		public closeConnection(): void {
			return;
		}
		public consume(
			eventName: string,
			callback: (event: Event, context: Context) => void,
		): void {
			const context = new mockContext();
			const event = new Event(eventName, { msg: 'test' });

			callback(event, context);
		}

		public async getConnection(): Promise<Connection> {
			return this.connection;
		}

		public produce(): void {
			return;
		}
	}

	it('Should be defined', () => {
		const broker = new Broker();
		expect(broker).toBeDefined;
	});

	it('Should call produce', () => {
		const broker = new Broker();
		const spy = jest.spyOn(broker, 'produce');
		broker.produce();
		expect(spy).toBeCalled();
	});

	it('Should get connection', () => {
		const broker = new Broker();
		const spy = jest.spyOn(broker, 'getConnection');
		broker.getConnection();
		expect(spy).toBeCalled();
	});
});
