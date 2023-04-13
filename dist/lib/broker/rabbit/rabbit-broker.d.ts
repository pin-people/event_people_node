import { Context } from '@lib/context';
import { Connection } from 'amqplib';
import { Event } from '../../event';
import { BaseBroker } from '../base-broker';
export declare class RabbitBroker implements BaseBroker {
    connection: Connection;
    consumers: [];
    private channel;
    private queue;
    private topic;
    /**
     *Open the rabbitmq connection if it's not properly Up already and returns it
     * @returns {Promise<Connection>}
     */
    getConnection(): Promise<Connection>;
    /**
     *Returns channel instance
     * @returns {Promise<Channel>}
     */
    private getChannel;
    consume(eventName: string, callback: (event: Event, context: Context) => void): Promise<void>;
    produce(event: Event): Promise<void>;
    closeConnection(): Promise<void>;
}
//# sourceMappingURL=rabbit-broker.d.ts.map