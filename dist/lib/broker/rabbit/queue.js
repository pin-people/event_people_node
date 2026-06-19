"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const event_1 = require("../../event");
const config_1 = require("../../config");
const rabbit_context_1 = require("./rabbit-context");
class Queue {
    channel;
    topic;
    config = config_1.Config;
    constructor(channel, topic) {
        this.channel = channel;
        this.topic = topic;
    }
    /**
     * Resolves the effective retry configuration by merging listener class static
     * attributes over the global Config defaults.
     * Precedence: listener static prop > Config.configure value > hardcoded default.
     */
    resolveRetryConfig(listenerClass) {
        const base = config_1.Config.getRetryConfig();
        if (!listenerClass)
            return base;
        return {
            maxAttempts: listenerClass.maxAttempts ?? base.maxAttempts,
            initialDelay: listenerClass.initialDelay ?? base.initialDelay,
            delayStrategy: listenerClass.delayStrategy ?? base.delayStrategy,
            dlqName: listenerClass.dlqName ?? base.dlqName,
        };
    }
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
    async subscribe(routingKey, method, listenerClass) {
        const retryConfig = this.resolveRetryConfig(listenerClass);
        const queueName = this.queueName(routingKey);
        const retryQueueName = `${queueName}_retry`;
        const dlqName = retryConfig.dlqName;
        // Declare the application-level DLQ as a plain durable queue. There is no DLX
        // fanout exchange or binding: failed messages are published to this queue
        // directly (see RabbitContext). Keeping it argument-free means there is no
        // broker-side dead-letter topology to drift between library versions.
        await this.channel.assertQueue(dlqName, { durable: true });
        // Declare retry queue — TTL is set per-message via expiration, not x-message-ttl
        await this.channel.assertQueue(retryQueueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': queueName,
            },
        });
        // Declare the main queue argument-free. Dead-lettering is handled at the
        // application level, so the main queue carries no x-dead-letter-exchange
        // argument and upgrades over legacy queues never hit PRECONDITION_FAILED.
        const assertedQueue = await this.channel.assertQueue(queueName, {
            exclusive: false,
            durable: true,
        });
        await this.channel.prefetch(1);
        await this.channel.bindQueue(assertedQueue.queue, this.topic.getTopic(), routingKey);
        await this.channel.consume(queueName, (message) => {
            if (!message)
                return;
            const eventPayload = JSON.parse(message.content.toString());
            const deliveryInfo = {
                deliveryTag: String(message.fields.deliveryTag),
                routingKey: message.fields.routingKey,
            };
            this.callback(deliveryInfo, eventPayload, message, method, listenerClass);
        });
    }
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
    callback(deliveryInfo, payload, message, method, listenerClass) {
        const retryConfig = this.resolveRetryConfig(listenerClass);
        const queueName = this.queueName(deliveryInfo.routingKey);
        const retryCount = Math.max(0, Number(message.properties?.headers?.['x-event-people-retries'] ?? 0));
        const event = new event_1.Event(deliveryInfo.routingKey, payload, 1.0, retryCount);
        const context = new rabbit_context_1.RabbitContext(this.channel, message, queueName, retryConfig.maxAttempts, retryConfig.initialDelay, retryConfig.delayStrategy, retryCount, retryConfig.dlqName);
        method(event, context);
    }
    /**
     * Returns the full queue name
     * @param {string}  routingKey  - queue path string
     * @returns {string} string
     */
    queueName(routingKey) {
        const fixed = event_1.Event.fixedEventName(routingKey, 'all');
        const name = `${config_1.Config.APP_NAME}-${fixed}`.toLowerCase();
        return name;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map