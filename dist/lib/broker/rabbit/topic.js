"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
const errors_1 = require("../../utils/errors");
class Topic {
    channel;
    topic;
    constructor(channel, topic) {
        this.channel = channel;
        this.topic = topic;
    }
    /**
     *Returns the topic string
     * @returns {String} topic string
     */
    getTopic() {
        return this.topic;
    }
    /**
     *Returns the queue channel
     * @returns {Channel} Channel
     */
    getChannel() {
        return this.channel;
    }
    /**
     * Publish a message event through the queue channel
     * @param {EVent} event - message event that will be produced
     */
    async produce(event) {
        if (!this.getTopic() || this.topic.length < 1)
            throw new errors_1.MissingAttributeError('topic');
        const content = Buffer.from(JSON.stringify(event.payload()));
        this.channel.publish(this.topic, event.getName(), content, {
            contentType: 'application/json',
            type: 'topic',
        });
    }
}
exports.Topic = Topic;
//# sourceMappingURL=topic.js.map