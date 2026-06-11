import { Context } from './context';
import { Event } from './event';
export declare class Listener {
    /**
     * Calls the broker consume method to receive stream events from certain queue.
     * Optional retry parameters fall back to Config defaults when not provided.
     * @param {string} eventName - string for queue event name
     * @param callback - action callback function to execute after consuming the event
     * @param {number} [maxAttempts] - max delivery attempts (default: Config.maxAttempts)
     * @param {string} [delayStrategy] - 'exponential' or 'fixed' (default: Config.delayStrategy)
     * @param {string} [dlqName] - dead-letter queue name (default: Config.dlqName)
     */
    static on(eventName: string, callback: (event: Event, context: Context) => void, maxAttempts?: number, delayStrategy?: string, dlqName?: string): void;
    /**
     * Normalizes event name with 'all' suffix
     * @param {string} eventName string name for the event
     * @returns {String} string
     */
    private consumedEventName;
}
//# sourceMappingURL=listener.d.ts.map