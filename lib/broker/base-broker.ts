import { Event } from '../event';
import { Connection } from './connection';

export interface BaseBroker {
	connection: Connection;
	consumers: any[];

	getConsumers(): void;
	getConnection(): Promise<Connection>;
	consume(eventName: string, callback: Function): void;
	produce(events: Event[]): void;
	closeConnection(): void;
}