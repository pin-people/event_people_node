export interface Context {
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
