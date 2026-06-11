"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryManager = void 0;
class RetryManager {
    maxAttempts;
    delayStrategy;
    static INITIAL_DELAY = parseInt(process.env.RABBIT_EVENT_PEOPLE_RETRY_TTL_MS || '1000', 10);
    static MAX_DELAY = 600000;
    constructor(maxAttempts, delayStrategy = 'exponential') {
        this.maxAttempts = maxAttempts;
        this.delayStrategy = delayStrategy;
    }
    /**
     * Returns whether the message should be retried based on the current retry count
     * @param {number} retryCount - current number of retries attempted
     * @returns {boolean}
     */
    shouldRetry(retryCount) {
        return retryCount < this.maxAttempts;
    }
    /**
     * Calculates the delay (in ms) before the next retry attempt
     * @param {number} retryCount - current number of retries attempted
     * @returns {number} delay in milliseconds
     */
    getNextDelay(retryCount) {
        if (this.delayStrategy === 'fixed') {
            return RetryManager.INITIAL_DELAY;
        }
        // exponential: initialDelay * (5 ^ retryCount)
        return Math.min(RetryManager.INITIAL_DELAY * Math.pow(5, retryCount), RetryManager.MAX_DELAY);
    }
}
exports.RetryManager = RetryManager;
//# sourceMappingURL=retry-manager.js.map