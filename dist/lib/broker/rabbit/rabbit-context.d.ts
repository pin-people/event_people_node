import { Channel } from 'amqplib';
import { Context } from '../../context';
import { Message } from 'amqplib/properties';
export declare class RabbitContext implements Context {
    private readonly channel;
    private readonly message;
    constructor(channel: Channel, message: Message);
    success(): void;
    fail(): void;
    reject(): void;
}
//# sourceMappingURL=rabbit-context.d.ts.map