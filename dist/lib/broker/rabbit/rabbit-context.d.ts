import { Channel } from 'amqplib';
import { Context } from '../../context';
import { Message } from 'amqplib/properties';
export declare class RabbitContext implements Context {
    private readonly channel;
    private readonly message;
    private readonly queueName;
    maxRetries: number;
    dlqName: string;
    private readonly retryCount;
    private readonly retryManager;
    constructor(channel: Channel, message: Message, queueName: string, maxRetries: number, initialDelay: number, delayStrategy: string, retryCount: number, dlqName: string);
    /**
     * True when the current attempt is the last before DLQ
     */
    get isLastRetry(): boolean;
    success(): void;
    /**
     * If retry attempts remain, republish to the retry queue with exponential/fixed delay.
     * Otherwise publish the message to the application-level DLQ and ack.
     */
    fail(): void;
    /**
     * Reject the message — route it directly to the application-level DLQ (no retries).
     */
    reject(): void;
    /**
     * Publish the current message to the application-level DLQ via the default
     * exchange (routing key = DLQ name) and ack. On a missing channel/DLQ name or
     * any publish failure, fall back to nack(requeue=false) so a failed message is
     * never requeued to the main queue without a retry increment.
     */
    private deadLetter;
    private nackWithoutRequeue;
}
//# sourceMappingURL=rabbit-context.d.ts.map