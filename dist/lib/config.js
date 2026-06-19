"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const rabbit_broker_1 = require("./broker/rabbit/rabbit-broker");
class Config {
    static broker;
    static APP_NAME;
    static TOPIC_NAME;
    static VHOST_NAME;
    static URL;
    static FULL_URL;
    static maxAttempts = 3;
    static initialDelay = 1000;
    static delayStrategy = 'exponential';
    static dlqName;
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * @param {BaseBroker} broker
     */
    constructor(broker) {
        Config.broker = broker || new rabbit_broker_1.RabbitBroker();
    }
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * Initialize getting the broker connection
     * @param {BaseBroker} broker
     */
    static async init() {
        Config.URL = process.env.RABBIT_URL;
        Config.VHOST_NAME = process.env.RABBIT_EVENT_PEOPLE_VHOST;
        Config.APP_NAME = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
        Config.TOPIC_NAME = process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME;
        Config.FULL_URL = `${Config.URL}/${Config.VHOST_NAME}`;
        // Apply hardcoded defaults only if not already set via configure()
        if (Config.maxAttempts === undefined)
            Config.maxAttempts = 3;
        if (Config.initialDelay === undefined)
            Config.initialDelay = 1000;
        if (Config.delayStrategy === undefined)
            Config.delayStrategy = 'exponential';
        if (!Config.dlqName)
            Config.dlqName = `${Config.APP_NAME}_dlq`;
        Config.broker ? Config.broker : (Config.broker = new rabbit_broker_1.RabbitBroker());
        await Config.broker.getConnection();
    }
    /**
     * Sets global retry defaults in code. Optional — when not called, hardcoded defaults apply.
     * Connection attributes (appName, url, vhost, topic) are always read from environment variables.
     * @param {RetryConfigOptions} options - { maxAttempts, initialDelay, delayStrategy, dlqName }
     */
    static configure(options) {
        if (options.maxAttempts !== undefined)
            Config.maxAttempts = options.maxAttempts;
        if (options.initialDelay !== undefined)
            Config.initialDelay = options.initialDelay;
        if (options.delayStrategy !== undefined)
            Config.delayStrategy = options.delayStrategy;
        if (options.dlqName !== undefined)
            Config.dlqName = options.dlqName;
    }
    /**
     * Returns the active global retry configuration.
     * @returns {{ maxAttempts: number; initialDelay: number; delayStrategy: string; dlqName: string }}
     */
    static getRetryConfig() {
        return {
            maxAttempts: Config.maxAttempts ?? 3,
            initialDelay: Config.initialDelay ?? 1000,
            delayStrategy: Config.delayStrategy ?? 'exponential',
            dlqName: Config.dlqName,
        };
    }
    /**
     * @returns {BaseBroker} BaseBroker
     */
    static getBroker() {
        return Config.broker;
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map