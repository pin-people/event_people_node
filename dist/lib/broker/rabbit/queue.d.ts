import { Channel } from 'amqplib';
import { Event } from '../../event';
import { BaseListener } from '../../listeners/base-listener';
import { Topic } from './topic';
import { Context } from '@lib/context';
export declare class Queue {
    private readonly channel;
    private readonly topic;
    private config;
    constructor(channel: Channel, topic: Topic);
    /**
     * Resolves the effective retry configuration by merging listener class static
     * attributes over the global Config defaults.
     * Precedence: listener static prop > Config.configure value > hardcoded default.
     */
    private resolveRetryConfig;
    /**
     * Makes a subscription to receive events for a certain routingKey.
     * Declares the application-level DLQ and retry queue topology before binding.
     * Retry configuration is resolved from listener class attributes (if provided),
     * falling back to Config defaults.
     * @param {string} routingKey - name path for the queue. Example: messages.*.all
     * @param {Function}  method - function to execute actions after event received
     * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
     * @returns {Promise<void>}
     */
    subscribe(routingKey: string, method: (event: Event, context: Context) => void, listenerClass?: typeof BaseListener): Promise<void>;
    /**
     * Callback to create new rabbit context to handle received message.
     * Builds Event + Context from broker delivery and calls user callback.
     * Retry config is resolved from listener class attributes (if provided),
     * falling back to Config defaults.
     * @param {DeliveryInfo} deliveryInfo - info about received queue message
     * @param {Record<string, any>} payload - the message body
     * @param {Message} message - raw AMQP message
     * @param {Function} method - next callback to execute
     * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
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