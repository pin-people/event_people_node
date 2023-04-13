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
     * Makes a subscription to receive events for a certain routingKey
     * @param {string} routingKey - name path for the queue. Example: messages.*.all
     * @param {Function}  method - function to execute actions after event received
     * @returns {Promise<Message>} Promise of Message
     *
     */
    async subscribe(routingKey, method) {
        const queueName = this.queueName(routingKey);
        const assertedQueue = await this.channel.assertQueue(queueName, {
            exclusive: false,
            durable: true,
        });
        await this.channel.prefetch(1);
        await this.channel.bindQueue(assertedQueue.queue, this.topic.getTopic(), routingKey);
        await this.channel.consume(queueName, (message) => {
            const eventPayload = JSON.parse(String(message.content));
            const deliveryInfo = {
                deliveryTag: String(message.fields.deliveryTag),
                routingKey: message.fields.routingKey,
            };
            this.callback(deliveryInfo, eventPayload, message, method);
        });
    }
    /**
     * Callback to create new rabbit context to handle received message
     * @param {string} deliveryInfo - info about recived queue message
     * @param {Record<string, any>}  payload - actually the body message
     * @param {Function} method - next callback to execute anything, like call context (ack, nack...whatever)
     * @returns {void} void
     *
     */
    callback(deliveryInfo, payload, message, method) {
        const event = new event_1.Event(deliveryInfo.routingKey, payload);
        const context = new rabbit_context_1.RabbitContext(this.channel, message);
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