import { Context } from './context';
import { Event } from './event';
import { BaseListener } from './listeners/base-listener';
export declare class Listener {
    /**
     * Calls the broker consume method to receive stream events from certain queue.
     * Retry configuration is read from the listener class attributes (if provided),
     * falling back to Config defaults.
     * @param {string} eventName - string for queue event name
     * @param callback - action callback function to execute after consuming the event
     * @param {typeof BaseListener} listenerClass - optional listener class for per-listener retry config
     */
    static on(eventName: string, callback: (event: Event, context: Context) => void, listenerClass?: typeof BaseListener): void;
    /**
     * Normalizes event name with 'all' suffix
     * @param {string} eventName string name for the event
     * @returns {String} string
     */
    private consumedEventName;
}
//# sourceMappingURL=listener.d.ts.map