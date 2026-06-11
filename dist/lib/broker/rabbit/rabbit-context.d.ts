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
    constructor(channel: Channel, message: Message, queueName: string, maxRetries: number, delayStrategy: string, retryCount: number, dlqName: string);
    /**
     * True when the current attempt is the last before DLQ
     */
    get isLastRetry(): boolean;
    success(): void;
    /**
     * If retry attempts remain, republish to the retry queue with exponential/fixed delay.
     * Otherwise nack without requeue (triggers DLX → DLQ).
     */
    fail(): void;
    /**
     * Reject the message — nack without requeue, triggers DLX → DLQ.
     */
    reject(): void;
}
//# sourceMappingURL=rabbit-context.d.ts.map