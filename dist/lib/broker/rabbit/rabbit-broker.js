"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitBroker = void 0;
const amqplib_1 = require("amqplib");
const config_1 = require("../../config");
const queue_1 = require("./queue");
const topic_1 = require("./topic");
class RabbitBroker {
    connection;
    consumers;
    channel;
    queue;
    topic;
    /**
     *Open the rabbitmq connection if it's not properly Up already and returns it
     * @returns {Promise<Connection>}
     */
    async getConnection() {
        if (!this.connection) {
            this.connection = await (0, amqplib_1.connect)(config_1.Config.FULL_URL);
        }
        this.channel = await this.getChannel();
        this.topic = new topic_1.Topic(this.channel, config_1.Config.TOPIC_NAME);
        this.queue = new queue_1.Queue(this.channel, this.topic);
        console.log('connection stablished');
        return this.connection;
    }
    /**
     *Returns channel instance
     * @returns {Promise<Channel>}
     */
    async getChannel() {
        if (!this.channel)
            return this.connection.createChannel();
        return this.channel;
    }
    async consume(eventName, callback) {
        this.queue.subscribe(eventName, callback);
    }
    async produce(event) {
        this.topic.produce(event);
    }
    async closeConnection() {
        await this.connection.close();
    }
}
exports.RabbitBroker = RabbitBroker;
//# sourceMappingURL=rabbit-broker.js.map