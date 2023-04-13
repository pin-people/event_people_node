import { Channel } from 'amqplib';
import { Event } from '../../event';
import { Topic } from './topic';
import { Context } from '@lib/context';
export declare class Queue {
    private readonly channel;
    private readonly topic;
    private config;
    constructor(channel: Channel, topic: Topic);
    /**
     * Makes a subscription to receive events for a certain routingKey
     * @param {string} routingKey - name path for the queue. Example: messages.*.all
     * @param {Function}  method - function to execute actions after event received
     * @returns {Promise<Message>} Promise of Message
     *
     */
    subscribe(routingKey: string, method: (event: Event, context: Context) => void): Promise<void>;
    /**
     * Callback to create new rabbit context to handle received message
     * @param {string} deliveryInfo - info about recived queue message
     * @param {Record<string, any>}  payload - actually the body message
     * @param {Function} method - next callback to execute anything, like call context (ack, nack...whatever)
     * @returns {void} void
     *
     */
    private callback;
    /**
     * Returns the full queue name
     * @param {string}  routingKey  - queue path string
     * @returns {string} string
     */
    private queueName;
}
//# sourceMappingURL=queue.d.ts.map