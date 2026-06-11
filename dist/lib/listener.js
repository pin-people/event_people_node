"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
const config_1 = require("./config");
const errors_1 = require("./utils/errors");
class Listener {
    /**
     * Calls the broker consume method to receive stream events from certain queue.
     * Optional retry parameters fall back to Config defaults when not provided.
     * @param {string} eventName - string for queue event name
     * @param callback - action callback function to execute after consuming the event
     * @param {number} [maxAttempts] - max delivery attempts (default: Config.maxAttempts)
     * @param {string} [delayStrategy] - 'exponential' or 'fixed' (default: Config.delayStrategy)
     * @param {string} [dlqName] - dead-letter queue name (default: Config.dlqName)
     */
    static on(eventName, callback, maxAttempts, delayStrategy, dlqName) {
        if (eventName.length <= 0)
            throw new errors_1.MissingAttributeError('Event name');
        config_1.Config.broker.consume(eventName, callback, maxAttempts, delayStrategy, dlqName);
    }
    /**
     * Normalizes event name with 'all' suffix
     * @param {string} eventName string name for the event
     * @returns {String} string
     */
    consumedEventName(eventName) {
        return eventName.split('.').length <= 3 ? `${eventName}.all` : eventName;
    }
}
exports.Listener = Listener;
//# sourceMappingURL=listener.js.map