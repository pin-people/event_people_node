export interface Context {
	/**
	 * Confirm message delivery and make the handshake with the channel
	 * @returns {void}
	 */
	success(eventMessage?: any): void;
	/**
	 * Deny message delivery and handshake with the channel
	 * @returns {void}
	 */
	fail(eventMessage?: any): void;
	/**
	 * Reject the message and handshake with the channel
	 * @returns {void}
	 */
	reject(eventMessage?: any): void;
}
