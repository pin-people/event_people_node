import { Event } from '../event';
import { Connection } from './connection';

export interface BaseBroker {
	connection: Connection;
	consumers: any[];
	getConnection(): Promise<Connection>;
	consume(eventName: string, callback: Function): void;
	produce(event: Event): void;
	closeConnection(): void;
}
