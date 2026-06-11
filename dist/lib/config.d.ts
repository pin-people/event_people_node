import { BaseBroker } from './broker/base-broker';
export declare class Config {
    static broker: BaseBroker;
    static APP_NAME: string;
    static TOPIC_NAME: string;
    static VHOST_NAME: string;
    static URL: string;
    static FULL_URL: string;
    static maxAttempts: number;
    static delayStrategy: string;
    static dlqName: string;
    /**
     *Setup for the Message broker that will handle events implementing BaseBroker
     * @param {BaseBroker} broker
     */
    constructor(broker?: BaseBroker);
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * Initialize getting the broker connection
     * * @param {BaseBroker} broker
     */
    static init(): Promise<void>;
    /**
     * Returns the retry configuration object
     * @returns {{ maxAttempts: number; delayStrategy: string; dlqName: string }}
     */
    static getRetryConfig(): {
        maxAttempts: number;
        delayStrategy: string;
        dlqName: string;
    };
    /**
     * @returns {BaseBroker} BaseBroker
     */
    static getBroker(): BaseBroker;
}
//# sourceMappingURL=config.d.ts.map