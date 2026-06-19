import { BaseBroker } from './broker/base-broker';
export declare type RetryConfigOptions = {
    maxAttempts?: number;
    initialDelay?: number;
    delayStrategy?: string;
    dlqName?: string;
};
export declare class Config {
    static broker: BaseBroker;
    static APP_NAME: string;
    static TOPIC_NAME: string;
    static VHOST_NAME: string;
    static URL: string;
    static FULL_URL: string;
    static maxAttempts: number;
    static initialDelay: number;
    static delayStrategy: string;
    static dlqName: string;
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * @param {BaseBroker} broker
     */
    constructor(broker?: BaseBroker);
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * Initialize getting the broker connection
     * @param {BaseBroker} broker
     */
    static init(): Promise<void>;
    /**
     * Sets global retry defaults in code. Optional — when not called, hardcoded defaults apply.
     * Connection attributes (appName, url, vhost, topic) are always read from environment variables.
     * @param {RetryConfigOptions} options - { maxAttempts, initialDelay, delayStrategy, dlqName }
     */
    static configure(options: RetryConfigOptions): void;
    /**
     * Returns the active global retry configuration.
     * @returns {{ maxAttempts: number; initialDelay: number; delayStrategy: string; dlqName: string }}
     */
    static getRetryConfig(): {
        maxAttempts: number;
        initialDelay: number;
        delayStrategy: string;
        dlqName: string;
    };
    /**
     * @returns {BaseBroker} BaseBroker
     */
    static getBroker(): BaseBroker;
}
//# sourceMappingURL=config.d.ts.map