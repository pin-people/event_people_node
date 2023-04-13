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
    /**
     *Setup for the Message broker that will handle events implementing BaseBroker
     * @param {BaseBroker} broker
     */
    constructor(broker) {
        Config.broker = broker || new rabbit_broker_1.RabbitBroker();
    }
    /**
     * Setup for the Message broker that will handle events implementing BaseBroker
     * Initialize getting the broker connection
     * * @param {BaseBroker} broker
     */
    static async init() {
        Config.URL = process.env.RABBIT_URL;
        Config.VHOST_NAME = process.env.RABBIT_EVENT_PEOPLE_VHOST;
        Config.APP_NAME = process.env.RABBIT_EVENT_PEOPLE_APP_NAME;
        Config.TOPIC_NAME = process.env.RABBIT_EVENT_PEOPLE_TOPIC_NAME;
        Config.FULL_URL = `${Config.URL}/${Config.VHOST_NAME}`;
        Config.broker ? Config.broker : (Config.broker = new rabbit_broker_1.RabbitBroker());
        await Config.broker.getConnection();
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