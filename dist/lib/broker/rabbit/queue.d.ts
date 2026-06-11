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
     * Makes a subscription to receive events for a certain routingKey.
     * Declares DLX, DLQ and retry queue topology before binding.
     * @param {string} routingKey - name path for the queue. Example: messages.*.all
     * @param {Function}  method - function to execute actions after event received
     * @param {number} maxAttempts - max delivery attempts before sending to DLQ
     * @param {string} delayStrategy - 'exponential' or 'fixed'
     * @param {string} dlqName - dead-letter queue name
     * @returns {Promise<void>}
     */
    subscribe(routingKey: string, method: (event: Event, context: Context) => void, maxAttempts?: number, delayStrategy?: string, dlqName?: string): Promise<void>;
    /**
     * Callback to create new rabbit context to handle received message
     * @param {DeliveryInfo} deliveryInfo - info about received queue message
     * @param {Record<string, any>} payload - the message body
     * @param {Message} message - raw AMQP message
     * @param {Function} method - next callback to execute
     * @param {string} queueName - name of the consuming queue
     * @param {number} maxAttempts - max delivery attempts
     * @param {string} delayStrategy - retry delay strategy
     * @param {number} retryCount - current retry count from headers
     * @param {string} dlqName - dead-letter queue name
     * @returns {void}
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