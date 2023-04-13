import { Event } from '../../event';
import { Channel } from 'amqplib';
export declare class Topic {
    private readonly channel;
    readonly topic: string;
    constructor(channel: Channel, topic: string);
    /**
     *Returns the topic string
     * @returns {String} topic string
     */
    getTopic(): string;
    /**
     *Returns the queue channel
     * @returns {Channel} Channel
     */
    getChannel(): Channel;
    /**
     * Publish a message event through the queue channel
     * @param {EVent} event - message event that will be produced
     */
    produce(event: Event): Promise<void>;
}
//# sourceMappingURL=topic.d.ts.map