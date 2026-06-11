export class RetryManager {
	private static readonly INITIAL_DELAY = parseInt(
		process.env.RABBIT_EVENT_PEOPLE_RETRY_TTL_MS || '1000',
		10,
	);
	private static readonly MAX_DELAY = 600_000;

	constructor(
		private maxAttempts: number,
		private delayStrategy: string = 'exponential',
	) {}

	/**
	 * Returns whether the message should be retried based on the current retry count
	 * @param {number} retryCount - current number of retries attempted
	 * @returns {boolean}
	 */
	shouldRetry(retryCount: number): boolean {
		return retryCount < this.maxAttempts;
	}

	/**
	 * Calculates the delay (in ms) before the next retry attempt
	 * @param {number} retryCount - current number of retries attempted
	 * @returns {number} delay in milliseconds
	 */
	getNextDelay(retryCount: number): number {
		if (this.delayStrategy === 'fixed') {
			return RetryManager.INITIAL_DELAY;
		}
		// exponential: initialDelay * (5 ^ retryCount)
		return Math.min(
			RetryManager.INITIAL_DELAY * Math.pow(5, retryCount),
			RetryManager.MAX_DELAY,
		);
	}
}
