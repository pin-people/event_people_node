export interface Context {
	/**
	 * Maximum number of delivery attempts before sending to DLQ
	 */
	maxRetries: number;

	/**
	 * True when the current attempt is the last before DLQ
	 */
	readonly isLastRetry: boolean;

	/**
	 * Name of the dead-letter queue
	 */
	dlqName: string;

	/**
	 * Confirm message delivery and make the handshake with the channel
	 * @returns {void} void
	 */
	success(): void;
	/**
	 * Deny message delivery and handshake with the channel
	 * @returns {void} void
	 */
	fail(): void;
	/**
	 * Reject the message and handshake with the channel
	 * @returns {void} void
	 */
	reject(): void;
}
