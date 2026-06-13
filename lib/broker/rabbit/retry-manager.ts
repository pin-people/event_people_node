import { Config } from '../../config';

export class RetryManager {
	private static readonly MAX_DELAY = 600_000;

	constructor(
		private maxAttempts: number,
		private delayStrategy: string = 'exponential',
		private initialDelay?: number,
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
	 * Calculates the delay (in ms) before the next retry attempt.
	 * Uses initialDelay from constructor (listener class attribute) or Config.initialDelay.
	 * Exponential: min(initialDelay * (5 ^ currentAttempt), maxDelay).
	 * Fixed: initialDelay (constant).
	 * @param {number} retryCount - current number of retries attempted
	 * @returns {number} delay in milliseconds
	 */
	getNextDelay(retryCount: number): number {
		const baseDelay = this.initialDelay ?? Config.initialDelay ?? 1000;
		if (this.delayStrategy === 'fixed') {
			return baseDelay;
		}
		// exponential: initialDelay * (5 ^ retryCount)
		return Math.min(
			baseDelay * Math.pow(5, retryCount),
			RetryManager.MAX_DELAY,
		);
	}
}
