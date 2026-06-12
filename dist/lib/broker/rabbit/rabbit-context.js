"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitContext = void 0;
const retry_manager_1 = require("./retry-manager");
class RabbitContext {
    channel;
    message;
    queueName;
    maxRetries;
    dlqName;
    retryCount;
    retryManager;
    constructor(channel, message, queueName, maxRetries, delayStrategy, retryCount, dlqName) {
        this.channel = channel;
        this.message = message;
        this.queueName = queueName;
        this.maxRetries = maxRetries;
        this.dlqName = dlqName;
        this.retryCount = retryCount;
        this.retryManager = new retry_manager_1.RetryManager(maxRetries, delayStrategy);
    }
    /**
     * True when the current attempt is the last before DLQ
     */
    get isLastRetry() {
        return this.retryCount >= this.maxRetries - 1;
    }
    success() {
        this.channel.ack(this.message, false);
    }
    /**
     * If retry attempts remain, republish to the retry queue with exponential/fixed delay.
     * Otherwise nack without requeue (triggers DLX → DLQ).
     */
    fail() {
        if (this.retryManager.shouldRetry(this.retryCount)) {
            const retryQueueName = `${this.queueName}_retry`;
            const delay = this.retryManager.getNextDelay(this.retryCount);
            const originalBody = this.message.content;
            try {
                this.channel.publish('', retryQueueName, Buffer.from(originalBody), {
                    headers: { 'x-event-people-retries': this.retryCount + 1 },
                    expiration: String(delay),
                    contentType: this.message.properties.contentType,
                });
                this.channel.ack(this.message, false);
            }
            catch (_err) {
                this.channel.nack(this.message, false, false);
            }
        }
        else {
            this.channel.nack(this.message, false, false);
        }
    }
    /**
     * Reject the message — nack without requeue, triggers DLX → DLQ.
     */
    reject() {
        this.channel.nack(this.message, false, false);
    }
}
exports.RabbitContext = RabbitContext;
//# sourceMappingURL=rabbit-context.js.map