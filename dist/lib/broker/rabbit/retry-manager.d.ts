export declare class RetryManager {
    private maxAttempts;
    private delayStrategy;
    private static readonly INITIAL_DELAY;
    private static readonly MAX_DELAY;
    constructor(maxAttempts: number, delayStrategy?: string);
    /**
     * Returns whether the message should be retried based on the current retry count
     * @param {number} retryCount - current number of retries attempted
     * @returns {boolean}
     */
    shouldRetry(retryCount: number): boolean;
    /**
     * Calculates the delay (in ms) before the next retry attempt
     * @param {number} retryCount - current number of retries attempted
     * @returns {number} delay in milliseconds
     */
    getNextDelay(retryCount: number): number;
}
//# sourceMappingURL=retry-manager.d.ts.map