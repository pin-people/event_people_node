import { Context } from '../context';
export declare type DeliveryInfo = {
    deliveryTag: string;
    routingKey: string;
};
export declare type ListenerConfig = {
    listener: typeof BaseListener;
    method: string;
    eventName: string;
};
export declare class BaseListener {
    context: Context;
    constructor(context: Context);
    /**
     * Address some method name for a event message and add it to global ListenerManager
     * @param {string} method - name for the class method tha will handle incoming events
     * @param {string} eventName - name for the queue event message
     */
    static bindEvent(method: string, eventName: string): void;
    /**
     * Confirm message delivery and make the handshake with the channel
     * @returns void
     */
    success(): void;
    /**
     * Deny message delivery and handshake with the channel
     * @returns void
     */
    fail(): void;
    /**
     * Reject the message and handshake with the channel
     * @returns void
     */
    reject(): void;
}
//# sourceMappingURL=base-listener.d.ts.map