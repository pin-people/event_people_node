import { Context } from './context';
import { Event } from './event';
export declare class Listener {
    /**
     * Calls the broker consume method to receive stream events from certain queue
     * @param {string} eventName string for queue event name
     * @param callback action callback function to execute after consuming the event
     */
    static on(eventName: string, callback: (event: Event, context: Context) => void): void;
    /**
     *Normilizes event name with 'all' suffix
     * @param {string} eventName string name for the event
     * @returns {String} string
     */
    private consumedEventName;
}
//# sourceMappingURL=listener.d.ts.map